
import subprocess

def get_user_commit_count(sha):
    try:
        # Count unique commit messages by Viraj to avoid counting rebased duplicates
        cmd = f'git log {sha} --author=Viraj --format="%s"'
        res = subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore')
        messages = set(m.strip() for m in res.splitlines() if m.strip())
        
        cmd2 = f'git log {sha} --author="Viraj Mahagavakar" --format="%s"'
        res2 = subprocess.check_output(cmd2, shell=True).decode('utf-8', errors='ignore')
        messages.update(m.strip() for m in res2.splitlines() if m.strip())
        
        return len(messages)
    except:
        return 0

# Get all unique SHAs from reflog
reflog_shas_cmd = 'git reflog --format="%h"'
reflog_shas = subprocess.check_output(reflog_shas_cmd, shell=True).decode('utf-8').splitlines()
unique_reflog_shas = list(set(s.strip() for s in reflog_shas if s.strip()))

results = []
for sha in unique_reflog_shas:
    count = get_user_commit_count(sha)
    results.append((sha, count))

# Sort by count descending
results.sort(key=lambda x: x[1], reverse=True)

with open('reflog_analysis.txt', 'w') as f:
    for sha, count in results[:20]:
        # Get subject of the sha
        subject = subprocess.check_output(f'git log -1 {sha} --format="%s"', shell=True).decode('utf-8', errors='ignore').strip()
        f.write(f"{sha} : {count} user commits : {subject}\n")

print("Analysis complete. Top SHAs saved to reflog_analysis.txt")
