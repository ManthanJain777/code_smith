import os
import re

frontend_src = r"e:\code_smith-v2\frontend\src"

REPLACEMENTS = [
    # Emojis with preceding/surrounding spaces
    ("👥 Compare Bids", "Compare Bids"),
    ("👥 Multi-Bidder Compare", "Multi-Bidder Compare"),
    ("🤖 Ask GeM Procurement Copilot", "Ask GeM Procurement Copilot"),
    ("⚠️ Review & Override Queue", "Review & Override Queue"),
    ("⚠️ Contradictions", "Contradictions"),
    ("⚡ Instant Run", "Instant Run"),
    ("⚡", ""),
    ("⚖️", ""),
    ("⚖", ""),
    ("👥", ""),
    ("🤖", ""),
    ("⚠️", ""),
    ("🚨", ""),
    ("📄", ""),
    ("📊", ""),
    ("📋", ""),
    ("⛓️", ""),
    ("⛓", ""),
    ("🛡️", ""),
    ("🛡", ""),
    ("📤", ""),
    ("🇮🇳", ""),
    ("🏆", ""),
    ("✓", "Valid"),
    ("✕", "Close"),
    ("✗", "Invalid"),
    ("🔒", ""),
    ("💡", ""),
    ("🎉", ""),
]

count = 0
for root, dirs, files in os.walk(frontend_src):
    for f in files:
        if f.endswith(('.tsx', '.ts')):
            path = os.path.join(root, f)
            with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
            
            modified = content
            for old, new in REPLACEMENTS:
                if old in modified:
                    modified = modified.replace(old, new)
            
            # Also catch any raw unicode emoji characters
            # U+1F300 to U+1F9FF, U+2600 to U+26FF, U+2700 to U+27BF
            raw_emoji = re.compile(r'[\U0001F300-\U0001F9FF]|[\u2600-\u26FF]|[\u2700-\u27BF]')
            modified = raw_emoji.sub('', modified)

            if modified != content:
                with open(path, 'w', encoding='utf-8') as fp:
                    fp.write(modified)
                count += 1
                print(f"Cleaned emojis from: {f}")

print(f"Total files updated: {count}")
