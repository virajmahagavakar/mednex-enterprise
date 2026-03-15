
with open('user_shas.txt', 'r') as f:
    all_shas = set(line.strip() for line in f if line.strip())
with open('main_user_shas.txt', 'r') as f:
    main_shas = set(line.strip() for line in f if line.strip())

missing = all_shas - main_shas
for sha in missing:
    print(sha)
