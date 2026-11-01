# -*- coding: utf-8 -*-
import os

print("Applying Navbar, White Mode Footer Fix, and Card Upload Functionality...")

# ----------------------------------------------------
# 1. Update css/styles.css
# ----------------------------------------------------
with open('css/styles.css', 'r', encoding='utf-8') as f:
    css = f.read().replace('\r\n', '\n')

# Add --ink-dark: #082126; to :root
if '--ink-dark:' not in css:
    css = css.replace('--ink-2: #14505A;', '--ink-2: #14505A;\n  --ink-dark: #082126;')

# Ensure .site-footer has explicit solid background
footer_old = """.site-footer {
  background: var(--ink-dark);
  color: #D7E5E3;
  padding: 3rem 0 2rem;
  border-top: 3px solid var(--brass);
}"""

footer_new = """.site-footer {
  background: #082126 !important;
  color: #D7E5E3 !important;
  padding: 3rem 0 2rem;
  border-top: 3px solid var(--brass);
}

.site-footer h2,
.site-footer h3 {
  color: #FFFFFF !important;
}

.site-footer p {
  color: #B8D6D4 !important;
}

.site-footer a {
  color: #E2F0EE !important;
  text-decoration: none;
  transition: color 0.2s ease;
}

.site-footer a:hover {
  color: var(--glass) !important;
}"""

if footer_old in css:
    css = css.replace(footer_old, footer_new, 1)

# Append new components CSS
new_components_css = """
/* ==========================================================================
   Desktop Navbar, Mobile 3-Dot Drawer & Prescription Card Upload Styles
   ========================================================================== */

/* Desktop Navigation */
.desktop-nav {
  display: none;
  align-items: center;
  gap: 0.65rem;
  margin: 0 1rem;
}

@media (min-width: 992px) {
  .desktop-nav {
    display: flex;
  }
}

.nav-link {
  color: var(--text);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  padding: 0.4rem 0.65rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link:focus-visible {
  color: var(--glass-dark);
  background-color: var(--glass-light);
}

.nav-link.nav-link-badge {
  background: var(--brass-light);
  color: var(--brass-dark);
  border: 1px solid rgba(200, 150, 62, 0.4);
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.nav-link.nav-link-badge:hover {
  background: var(--brass);
  color: #FFFFFF;
}

[data-theme="dark"] .nav-link {
  color: #E2F0EE;
}

[data-theme="dark"] .nav-link:hover {
  color: var(--glass);
  background: rgba(43, 181, 176, 0.15);
}

[data-theme="dark"] .nav-link.nav-link-badge {
  background: rgba(200, 150, 62, 0.22);
  color: #FFD17D;
  border-color: rgba(200, 150, 62, 0.45);
}

/* Mobile 3-Dot Menu Button */
.menu-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
  padding: 0 0.5rem;
  min-width: 44px;
  height: 44px;
}

@media (min-width: 992px) {
  .menu-toggle-btn {
    display: none !important;
  }
}

.three-dots-icon {
  font-size: 1.7rem;
  line-height: 1;
  letter-spacing: -2px;
}

/* Mobile Nav Backdrop */
.mobile-nav-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.mobile-nav-backdrop.active {
  opacity: 1;
  pointer-events: auto;
}

/* Mobile Nav Drawer */
.mobile-nav-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(340px, 86vw);
  background: var(--card);
  z-index: 1001;
  box-shadow: -4px 0 25px rgba(0, 0, 0, 0.3);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-left: 2px solid var(--line);
}

.mobile-nav-drawer.active {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid var(--line);
  background: var(--bg);
}

.drawer-brand .brand-title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  color: var(--heading);
  display: block;
  line-height: 1.9;
}

.drawer-brand .brand-sub {
  font-size: 0.85rem;
  color: var(--muted);
}

.drawer-close-btn {
  background: none;
  border: 1.5px solid var(--line);
  border-radius: var(--radius-sm);
  width: 42px;
  height: 42px;
  font-size: 1.3rem;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.drawer-close-btn:hover {
  background: var(--line);
}

.drawer-quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--line);
}

.drawer-quick-actions .btn {
  font-size: 0.92rem;
  padding: 0.5rem 0.6rem;
  min-height: 44px;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  padding: 0.75rem 0;
}

.drawer-link {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.85rem 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease;
  border-right: 3px solid transparent;
}

.drawer-link:hover,
.drawer-link:focus-visible {
  background: var(--glass-light);
  color: var(--glass-dark);
  border-right-color: var(--glass);
}

.drawer-link-highlight {
  background: var(--brass-light);
  color: var(--brass-dark);
  font-weight: 700;
  margin: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(200, 150, 62, 0.4);
}

.drawer-link-highlight:hover {
  background: var(--brass);
  color: #FFFFFF;
}

.drawer-icon {
  font-size: 1.3rem;
  line-height: 1;
}

.drawer-footer {
  margin-top: auto;
  padding: 1.25rem;
  border-top: 1px solid var(--line);
  font-size: 0.85rem;
  color: var(--muted);
  text-align: center;
}

/* ==========================================================================
   Prescription / Eye Card Upload Component
   ========================================================================== */
.prescription-upload-card {
  background: var(--card);
  border: 2px dashed var(--glass);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin-bottom: 1.75rem;
  transition: all 0.25s ease;
  box-shadow: var(--shadow-sm);
}

.prescription-upload-card.has-file {
  border-style: solid;
  border-color: var(--wa);
  background: rgba(31, 168, 85, 0.05);
}

.prescription-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.prescription-icon {
  font-size: 2.2rem;
  line-height: 1;
  flex-shrink: 0;
  background: var(--glass-light);
  padding: 0.6rem;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(43, 181, 176, 0.3);
}

.prescription-title {
  font-size: 1.25rem;
  color: var(--heading);
  margin-bottom: 0.35rem;
  font-weight: 700;
}

.prescription-sub {
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.6;
}

.prescription-upload-zone {
  position: relative;
  background: var(--bg);
  border: 1.5px dashed var(--line);
  border-radius: var(--radius-sm);
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.prescription-upload-zone:hover {
  border-color: var(--glass);
  background: var(--glass-light);
}

.prescription-file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 5;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  pointer-events: none;
}

.upload-placeholder .upload-icon {
  font-size: 2.4rem;
}

.upload-placeholder .upload-btn-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--heading);
}

.upload-placeholder .upload-hint {
  font-size: 0.88rem;
  color: var(--muted);
}

/* Upload Preview */
.upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 10;
}

@media (min-width: 540px) {
  .upload-preview {
    flex-direction: row;
    text-align: right;
  }
}

.upload-preview img {
  max-width: 160px;
  max-height: 140px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 2px solid var(--wa);
  box-shadow: var(--shadow-sm);
}

.preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.preview-badge {
  color: var(--wa);
  font-weight: 700;
  font-size: 1.1rem;
}

.preview-name {
  font-size: 0.9rem;
  color: var(--muted);
  word-break: break-all;
}

.preview-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.4rem;
  flex-wrap: wrap;
}

/* Card Reminder Confirmation Modal */
.card-reminder-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.card-reminder-content {
  background: var(--card);
  border: 2px solid var(--wa);
  border-radius: var(--radius-md);
  max-width: 520px;
  width: 100%;
  padding: 1.75rem;
  text-align: center;
  box-shadow: var(--shadow-lg);
  max-height: 90vh;
  overflow-y: auto;
}

.card-reminder-img {
  max-height: 220px;
  max-width: 100%;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  margin: 1rem auto;
  object-fit: contain;
}
"""

if '.desktop-nav' not in css:
    css += '\n' + new_components_css

with open('css/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Updated css/styles.css successfully!")
