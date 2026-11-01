with open('css/styles.css', 'r', encoding='utf-8') as f:
    text = f.read()

target = """.clear-filters-btn {
  background: transparent;
  color: var(--danger);
  border: 1px dashed var(--danger);
  padding: 0.4rem 1rem;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  min-height: 40px;
}"""

replacement = """.clear-filters-btn {
  background: transparent;
  color: #B71C1C;
  border: 1.5px dashed #B71C1C;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  min-height: 40px;
}

[data-theme="dark"] .clear-filters-btn {
  color: #FF8A80;
  border-color: #FF8A80;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .clear-filters-btn {
    color: #FF8A80;
    border-color: #FF8A80;
  }
}"""

if target in text:
    text = text.replace(target, replacement)
    with open('css/styles.css', 'w', encoding='utf-8') as f:
        f.write(text)
    print("Patched clear-filters-btn contrast!")
else:
    print("Target not found!")
