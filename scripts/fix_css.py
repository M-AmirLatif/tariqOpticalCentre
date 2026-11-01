with open('css/styles.css', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
new_lines = []
i = 0
while i < len(lines):
    line = lines[i]
    if i + 1 < len(lines) and '@media (prefers-color-scheme: dark) {' in lines[i+1] and line.strip().endswith(','):
        sel = line.strip()[:-1].strip()
        # Find the inner block inside the @media
        j = i + 2
        inner_sel = lines[j].replace('{', '').strip()
        k = j + 1
        body_lines = []
        while k < len(lines) and not lines[k].strip().startswith('}'):
            body_lines.append(lines[k])
            k += 1
        body = '\n'.join(body_lines)
        
        replacement = f"{sel} {{\n{body}\n}}\n\n@media (prefers-color-scheme: dark) {{\n  :root:not([data-theme=\"light\"]) {inner_sel} {{\n{body}\n  }}\n}}"
        new_lines.append(replacement)
        
        # Advance i to beyond the closing brace of media
        m = k + 1
        while m < len(lines) and not lines[m].strip().startswith('}'):
            m += 1
        i = m + 1
    else:
        new_lines.append(line)
        i += 1

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write('\n'.join(new_lines))

print('Fixed CSS successfully!')
