
import subprocess

def get_main_shas():
    cmd = 'git log main --format="%h"'
    res = subprocess.check_output(cmd, shell=True).decode('utf-8').splitlines()
    return set(s.strip() for s in res if s.strip())

def get_all_user_shas():
    shas = set()
    for author in ["Viraj", "Viraj Mahagavakar"]:
        cmd = f'git log --all --reflog --author="{author}" --format="%h"'
        res = subprocess.check_output(cmd, shell=True).decode('utf-8').splitlines()
        shas.update(s.strip() for s in res if s.strip())
    return shas

main_shas = get_main_shas()
all_user_shas = get_all_user_shas()

missing_shas = all_user_shas - main_shas

results = []
for sha in missing_shas:
    try:
        cmd = f'git log -1 {sha} --format="%ci | %h | %s"'
        info = subprocess.check_output(cmd, shell=True).decode('utf-8', errors='ignore').strip()
        results.append(info)
    except:
        pass

results.sort(reverse=True)

with open('missing_user_commits.txt', 'w') as f:
    for line in results:
        f.write(line + "\n")

print(f"Found {len(results)} missing user commits. Saved to missing_user_commits.txt")
