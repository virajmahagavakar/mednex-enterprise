
import subprocess

def get_count(sha):
    try:
        return int(subprocess.check_output(f'git rev-list --count {sha}', shell=True).decode().strip())
    except:
        return 0

shas = subprocess.check_output('git reflog --format="%h"', shell=True).decode().splitlines()
unique_shas = set(s.strip() for s in shas if s.strip())

counts = []
for s in unique_shas:
    c = get_count(s)
    counts.append((s, c))

counts.sort(key=lambda x: x[1], reverse=True)

with open('sha_counts.txt', 'w') as f:
    for s, c in counts[:10]:
        msg = subprocess.check_output(f'git log -1 {s} --format="%s"', shell=True).decode('utf-8', errors='ignore').strip()
        f.write(f"{s} : {c} : {msg}\n")

print("Done. Check sha_counts.txt")
