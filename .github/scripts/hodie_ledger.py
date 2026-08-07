#!/usr/bin/env python3
"""Fill any missing day in the HODIE ledger on nanobotco.github.io.

Runs in GitHub Actions. Surveys the NaNoBotCo account for public work shipped
since the ledger's newest entry, asks Claude for one line per missing day, checks
every link, and rewrites the ledger block in index.html.

Writes nothing when there is nothing new — a silent run is a correct run.
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

import anthropic
from pydantic import BaseModel, Field

LOCAL_TZ = timezone(timedelta(hours=7))  # NaN is UTC+7
ACCOUNT = "NaNoBotCo"
MODEL = "claude-opus-5"
MAX_ENTRIES = 9
REPO_PAGE_SIZE = 40

ROOT = Path(__file__).resolve().parents[2]
INDEX = ROOT / "index.html"
PLAYBOOK = ROOT / ".github" / "hodie-playbook.md"

BEGIN_RE = re.compile(r"^(\s*)<!-- HODIE-LEDGER:BEGIN.*?-->\s*$", re.M)
END_RE = re.compile(r"^(\s*)<!-- HODIE-LEDGER:END -->\s*$", re.M)
ENTRY_DATE_RE = re.compile(r'<time datetime="(\d{4}-\d{2}-\d{2})"')
HREF_RE = re.compile(r'href="(https?://[^"]+)"')

# Repos that only ever emit rebuild churn — never a finished thing.
CHURN_REPOS = {"Lanna"}


def log(msg: str) -> None:
    print(msg, flush=True)


# --------------------------------------------------------------------------- #
# GitHub survey
# --------------------------------------------------------------------------- #


def gh(path: str) -> object:
    """GET a public GitHub API path. Uses GITHUB_TOKEN when present."""
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "hodie-ledger",
            **(
                {"Authorization": f"Bearer {os.environ['GITHUB_TOKEN']}"}
                if os.environ.get("GITHUB_TOKEN")
                else {}
            ),
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def to_local(iso_utc: str) -> datetime:
    return datetime.fromisoformat(iso_utc.replace("Z", "+00:00")).astimezone(LOCAL_TZ)


def survey(cutoff: datetime) -> list[dict]:
    """Public repos with commits after `cutoff` (local time), newest first."""
    repos = gh(f"/users/{ACCOUNT}/repos?sort=pushed&per_page={REPO_PAGE_SIZE}")
    candidates: list[dict] = []

    for repo in repos:
        if repo.get("private") or repo["name"] in CHURN_REPOS:
            continue
        if to_local(repo["pushed_at"]) <= cutoff:
            break  # sorted by pushed desc — everything after this is older

        name = repo["name"]
        try:
            commits = gh(f"/repos/{ACCOUNT}/{name}/commits?per_page=30")
        except urllib.error.HTTPError as exc:  # empty repo, or moved
            log(f"  skipped {name}: commits unavailable ({exc.code})")
            continue

        fresh = [
            {
                "date": to_local(c["commit"]["author"]["date"]).strftime("%Y-%m-%d"),
                "message": c["commit"]["message"].split("\n")[0],
            }
            for c in commits
            if to_local(c["commit"]["author"]["date"]) > cutoff
            # the ledger writing itself is not a finished thing
            and not c["commit"]["message"].startswith("HODIE ledger:")
        ]
        if not fresh:
            continue

        candidates.append(
            {
                "repo": name,
                "description": repo.get("description") or "",
                "live_url": repo.get("homepage") or "",
                "has_pages": bool(repo.get("has_pages")),
                "created_at": to_local(repo["created_at"]).strftime("%Y-%m-%d"),
                "commits": fresh,
            }
        )
        log(f"  {name}: {len(fresh)} commit(s) since cutoff")

    return candidates


# --------------------------------------------------------------------------- #
# Ledger parsing and rendering
# --------------------------------------------------------------------------- #


def split_ledger(html: str) -> tuple[str, str, str, str]:
    """Return (head, indent, body, tail) around the ledger block."""
    begin, end = BEGIN_RE.search(html), END_RE.search(html)
    if not begin or not end or begin.end() >= end.start():
        sys.exit("FATAL: HODIE-LEDGER markers missing or out of order in index.html")
    return html[: begin.end()], begin.group(1), html[begin.end() : end.start()], html[end.start() :]


def existing_dates(body: str) -> list[str]:
    return ENTRY_DATE_RE.findall(body)


def render(indent: str, entries: dict[str, str]) -> str:
    """entries: {YYYY-MM-DD: inner html of .did}. Newest first, capped, wick on top."""
    lines = []
    for i, date in enumerate(sorted(entries, reverse=True)[:MAX_ENTRIES]):
        y, m, d = date.split("-")
        cls = "ledger-day today" if i == 0 else "ledger-day"
        wick = '<span class="wick" aria-hidden="true"></span>' if i == 0 else ""
        lines.append(
            f'{indent}<li class="{cls}">{wick}'
            f'<time datetime="{date}">{d}·{m}·{y}</time>'
            f'<span class="did">{entries[date]}</span></li>'
        )
    return "\n" + "\n".join(lines) + "\n"


def parse_existing(body: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for li in re.findall(r"<li class=\"ledger-day.*?</li>", body, re.S):
        date = ENTRY_DATE_RE.search(li)
        did = re.search(r'<span class="did">(.*?)</span></li>', li, re.S)
        if date and did:
            out[date.group(1)] = did.group(1)
    return out


# --------------------------------------------------------------------------- #
# Link checking
# --------------------------------------------------------------------------- #


def link_ok(url: str) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": "hodie-ledger"})
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return resp.status == 200
    except Exception as exc:
        log(f"  link check failed for {url}: {exc}")
        return False


# --------------------------------------------------------------------------- #
# Claude
# --------------------------------------------------------------------------- #


class Entry(BaseModel):
    date: str = Field(description="Ship date in local time, YYYY-MM-DD")
    line_html: str = Field(
        description="The sentence, as inner HTML for <span class='did'>. "
        "May contain <a href> links. No surrounding <span> or <li>."
    )


class Ledger(BaseModel):
    entries: list[Entry] = Field(
        description="One entry per missing day that had public-safe work. Empty if none."
    )
    note: str = Field(description="One short line on what you chose and why, or why nothing.")


def ask_claude(playbook: str, cutoff: str, missing: list[str], candidates: list[dict]) -> Ledger:
    client = anthropic.Anthropic()
    response = client.messages.parse(
        model=MODEL,
        max_tokens=16000,
        system=playbook,
        output_format=Ledger,
        messages=[
            {
                "role": "user",
                "content": (
                    f"The ledger's newest entry is {cutoff}.\n"
                    f"Days with no line yet: {', '.join(missing) or '(none)'}\n\n"
                    "Candidate work, surveyed from the public NaNoBotCo GitHub account "
                    "(dates already converted to local UTC+7):\n\n"
                    f"{json.dumps(candidates, indent=2, ensure_ascii=False)}"
                ),
            }
        ],
    )
    if response.stop_reason == "refusal":
        sys.exit(f"FATAL: request refused ({response.stop_details})")
    if response.parsed_output is None:
        sys.exit("FATAL: no structured output returned")
    return response.parsed_output


# --------------------------------------------------------------------------- #


def main() -> int:
    html = INDEX.read_text(encoding="utf-8")
    head, indent, body, tail = split_ledger(html)
    entries = parse_existing(body)
    if not entries:
        sys.exit("FATAL: no existing ledger entries parsed — refusing to rewrite")

    newest = max(entries)
    cutoff = datetime.strptime(newest, "%Y-%m-%d").replace(tzinfo=LOCAL_TZ) + timedelta(days=1)
    today = datetime.now(LOCAL_TZ).date()
    missing = []
    day = cutoff.date()
    while day <= today:
        if day.isoformat() not in entries:
            missing.append(day.isoformat())
        day += timedelta(days=1)

    log(f"newest ledger entry: {newest}")
    log(f"days with no line yet: {', '.join(missing) or '(none)'}")
    if not missing:
        log("nothing to fill — ending quietly")
        return 0

    log("surveying public NaNoBotCo repos…")
    candidates = survey(cutoff)
    if not candidates:
        log("no public work since cutoff — ending quietly")
        return 0

    result = ask_claude(PLAYBOOK.read_text(encoding="utf-8"), newest, missing, candidates)
    log(f"claude: {result.note}")

    added = 0
    for entry in result.entries:
        if entry.date not in missing:
            log(f"  rejected {entry.date}: not a missing day")
            continue
        links = HREF_RE.findall(entry.line_html)
        if any(not link_ok(u) for u in links):
            log(f"  rejected {entry.date}: a link did not return 200")
            continue
        entries[entry.date] = entry.line_html
        log(f"  + {entry.date}")
        added += 1

    if not added:
        log("nothing survived checking — ending quietly")
        return 0

    updated = head + render(indent, entries) + tail
    if updated == html:
        log("no byte change — ending quietly")
        return 0

    INDEX.write_text(updated, encoding="utf-8")
    dates = sorted((e.date for e in result.entries if e.date in entries), reverse=True)
    Path(os.environ.get("GITHUB_OUTPUT", "/dev/null")).open("a").write(
        f"changed=true\ndates={' '.join(dates)}\n"
    )
    log(f"wrote {added} entrie(s) to index.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
