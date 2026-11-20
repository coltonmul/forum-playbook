#!/opt/homebrew/bin/python3
"""build-constitution.py: builds forumplaybook.com/constitution/ (the Nashville Forum Constitution Template). VERSION 1.1.0 (2026-11-18)

  /opt/homebrew/bin/python3 tools/build-constitution.py

One source, four outputs. constitution/_src/content.py holds the template's text (sections 01-16, appendices A-B);
this script renders from it:
  constitution/index.html                                          the page (from _src/index.html + constitution.css)
  constitution/nashville-forum-constitution-template-<VER>.md      the Markdown (the copy buttons embed the same text)
  constitution/nashville-forum-constitution-template-<VER>.docx    an editable Word document, US Letter
  constitution/nashville-forum-constitution-template-<VER>.pdf     the same content, printed by headless Chrome
  constitution/og.png                                              1200 x 630, from og.html
  previews/nashville-forum-constitution-template.png              page one of the PDF, about 1000 px wide

Draws the icons with icon.py (Phosphor, thin), writes the footer page list from build-catalyst.py (the one canonical
list), stamps the time from `date`, prints the contrast table for the color pairs the page and the documents use and
stops on a fail, and guards against em dashes (every output, the Word text included), leftover tokens, promise words in
the page's own copy (the constitution's rule text is exempt), off-site links without a new tab, and drift between the
Markdown file and the text the copy buttons carry.

Changelog (the full history stays here, never on the page)
  1.1.0  Appendix C (ten open items in the chapter template) is off the public template (Colton, 2026-11-18: "Yes,
         remove it"). Version label V2026.11.18; the V2026.11.16 files are removed from the site.
  1.0.0  First version (Colton, 2026-11-16): the Forum 14 topical layout, in Forum Playbook's Schematic Light, with the
         EO Nashville logo, copy and compare buttons, and Markdown, Word and PDF downloads. Version label V2026.11.16.
"""
import html, importlib.util, json, os, re, shutil, subprocess, sys, tempfile, zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = os.path.join(ROOT, "constitution")
spec = importlib.util.spec_from_file_location("bc", os.path.join(ROOT, "tools", "build-catalyst.py"))
bc = importlib.util.module_from_spec(spec); spec.loader.exec_module(bc)
spec = importlib.util.spec_from_file_location("content", os.path.join(D, "_src", "content.py"))
C = importlib.util.module_from_spec(spec); spec.loader.exec_module(C)
ICON_DIR = os.path.expanduser("~/Sites/brand-assets/icons")
sys.path.insert(0, ICON_DIR)
import icon as ph  # noqa: E402  the house Phosphor reader and Chrome rasterizer

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PDFTOPPM = "/opt/homebrew/bin/pdftoppm"
LOGO_SRC = "/Users/calvin/brand-assets/eo/logos/nashville/EO_Nashville_RGB_primary.png"
STAMP = subprocess.check_output(["date", "+Updated %a / %Y-%m-%d / %-I:%M %p CT"], text=True).strip()
VER = C.VERSION
BASE = f"nashville-forum-constitution-template-{VER}"
MD_FILE, DOCX_FILE, PDF_FILE = BASE + ".md", BASE + ".docx", BASE + ".pdf"
PREVIEW = os.path.join(ROOT, "previews", "nashville-forum-constitution-template.png")
ALL = C.SECTIONS
BREAK_BEFORE = ("sign", "appendix-a")  # topics that start a fresh page in the Word and PDF files
EMDASH = chr(0x2014)  # written as a code point so this file holds no em dash itself
INTRO_DOC = ("This is the EO Nashville chapter's forum constitution template, sorted by topic so a forum can read it and fill it "
             "out in one sitting. Nothing was added and nothing was taken out. The fines are in one table, every vote is in one "
             "table, and the blanks to fill in are listed in Appendix B.")
PROMPT_HEAD = ("Below are two forum constitutions. The first is the Nashville Forum Constitution Template (" + VER + ") from Forum "
               "Playbook. The second is my forum's constitution. Compare them topic by topic and tell me: 1) what the template covers "
               "that mine does not, 2) what mine covers that the template does not, 3) where the two disagree, and 4) the five changes "
               "that would most improve mine, with suggested wording. Be plain and specific.")
PROMPT_TAIL = "MY FORUM'S CONSTITUTION:\n\n(paste yours here)\n"

# ---------- contrast: computed, never eyeballed (LEGIBILITY LAW) ----------
def lum(hexc):
    hexc = hexc.lstrip("#")
    rgb = [int(hexc[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    rgb = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in rgb]
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]


def ratio(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


GROUNDS = ("#FFFFFF", "#F0EBE0", "#F6E9C9", "#DCEBEA", "#F8DFD3", "#E8E2D6")
PAIRS = ([("#0E0E0C", g, 7.0, "reading text") for g in GROUNDS] +
         [("#4A4038", g, 7.0, "secondary text") for g in GROUNDS] +
         [("#B83A14", "#FFFFFF", 4.5, "topic numbers, labels"), ("#B83A14", "#F0EBE0", 4.5, "Jump to numbers"),
          ("#2A6E9A", "#FFFFFF", 4.5, "links"), ("#2A6E9A", "#F0EBE0", 4.5, "links on linen"), ("#2A6E9A", "#DCEBEA", 4.5, "link in the compare block"),
          ("#FFFFFF", "#2A6E9A", 4.5, "button label after the hover wave"), ("#0E0E0C", "#E8521A", 4.5, "first button label"),
          ("#F0EBE0", "#0E0E0C", 7.0, "stamp bar, footer links"), ("#C9C2B6", "#0E0E0C", 7.0, "footer text"),
          ("#E8521A", "#FFFFFF", 3.0, "document H2, 14pt bold (display size)"),
          ("#0E0E0C", "#FFFFFF", 3.0, "button edge"), ("#E8521A", "#FFFFFF", 3.0, "Jump to marker on white"),
          ("#2A6E9A", "#F0EBE0", 3.0, "focus ring"), ("#4A4038", "#FFFFFF", 3.0, "phone chip edge")])
print("contrast (computed):")
fails = []
for fg, bg, need, what in PAIRS:
    r = ratio(fg, bg)
    ok = r >= need
    print(f"  {'PASS' if ok else 'FAIL'} {fg} on {bg}: {r:5.2f}:1 (needs {need}:1)  {what}")
    if not ok: fails.append(f"{fg} on {bg} {r:.2f}")
if fails: sys.exit("guard failed: contrast " + ", ".join(fails))

# ---------- inline marks ----------
TOK = re.compile(r"\*\*(.+?)\*\*|\[(.+?)\]\((#[^)]+)\)|\{\{blank(-short)?\}\}")


def segs(s):
    """Split a string into (kind, text, extra): kind is t (plain), b (bold), a (link), blank."""
    out, i = [], 0
    for m in TOK.finditer(s):
        if m.start() > i: out.append(("t", s[i:m.start()], None))
        if m.group(1) is not None: out.append(("b", m.group(1), None))
        elif m.group(2) is not None: out.append(("a", m.group(2), m.group(3)))
        else: out.append(("blank", "", "short" if m.group(4) else ""))
        i = m.end()
    if i < len(s): out.append(("t", s[i:], None))
    return out


def ih(s):  # inline to HTML
    r = ""
    for k, t, x in segs(s):
        if k == "t": r += html.escape(t, quote=False)
        elif k == "b": r += "<strong>" + html.escape(t, quote=False) + "</strong>"
        elif k == "a": r += f'<a href="{x}">' + html.escape(t, quote=False) + "</a>"
        else: r += f'<span class="blank{" short" if x else ""}"><span class="sr">blank to fill in</span></span>'
    return r


def im(s):  # inline to Markdown
    r = ""
    for k, t, x in segs(s):
        if k == "t": r += t
        elif k == "b": r += "**" + t + "**"
        elif k == "a": r += t
        else: r += "________"
    return r


def plain(s):
    return "".join(("________" if k == "blank" else t) for k, t, x in segs(s))


def cell(c):
    """A table cell as (text, kind, colspan)."""
    if isinstance(c, str): return c, "", 1
    if len(c) == 2: return c[0], c[1], 1
    return c[0], c[1], c[2]


def icon_svg(name, size=52):
    return ph.inline_svg(name, "thin", size)


# ---------- the page ----------
def page_blocks(blocks):
    out = []
    for b in blocks:
        k = b[0]
        if k == "lead": out.append(f'<p class="lead">{ih(b[1])}</p>')
        elif k == "p": out.append(f"<p>{ih(b[1])}</p>")
        elif k == "h3": out.append(f"<h3>{ih(b[1])}</h3>")
        elif k == "ul": out.append("<ul>" + "".join(f"<li>{ih(x)}</li>" for x in b[1]) + "</ul>")
        elif k == "ol": out.append('<ol class="ladder">' + "".join(f"<li>{ih(x)}</li>" for x in b[1]) + "</ol>")
        elif k == "box":
            _, tone, hd, paras = b
            out.append(f'<div class="box {tone}"><p class="hd">{ih(hd)}</p>' + "".join(f"<p>{ih(p)}</p>" for p in paras) + "</div>")
        elif k == "kv":
            _, cap, rows = b
            capx = f"<caption>{ih(cap)}</caption>" if cap else ""
            body = "".join(f'<tr><th scope="row">{ih(t)}</th><td>{ih(v)}</td></tr>' for t, v in rows)
            out.append(f'<div class="tw kv"><table>{capx}<tbody>{body}</tbody></table></div>')
        elif k == "table":
            _, cap, head, rows = b
            capx = f"<caption>{ih(cap)}</caption>" if cap else ""
            label = html.escape(plain(cap) if cap else "Table: " + ", ".join(h for h in head if h), quote=True)
            th = "<thead><tr>" + "".join(f'<th scope="col">{ih(h)}</th>' if h else '<td></td>' for h in head) + "</tr></thead>"
            body = ""
            for r in rows:
                body += "<tr>"
                for c in r:
                    t, kind, span = cell(c)
                    sp = f' colspan="{span}"' if span > 1 else ""
                    if kind == "th": body += f'<th scope="row"{sp}>{ih(t)}</th>'
                    elif kind in ("miss", "out"): body += f'<td{sp}><span class="chip {kind}">{ih(t)}</span></td>'
                    else:
                        cls = f' class="{kind}"' if kind else ""
                        body += f"<td{sp}{cls}>{ih(t)}</td>"
                body += "</tr>"
            if len(head) == 2 and all(cell(r[0])[1] == "th" for r in rows):  # a named-row table stacks on a phone
                out.append(f'<div class="tw kv"><table>{capx}{th}<tbody>{body}</tbody></table></div>')
            else:
                wide = " wide" if len(head) > 2 else ""
                out.append(f'<div class="tw scroll{wide}" role="region" aria-label="{label}" tabindex="0"><table>{capx}{th}<tbody>{body}</tbody></table></div>')
        elif k == "sig":
            rows = "".join('<div class="sigrow"><span>Signed</span><div class="sigline"></div><span>Date</span><div class="sigdate"></div></div>' for _ in range(b[1]))
            out.append(f'<div class="sig">{rows}</div>')
        elif k == "roles":
            body = "".join(f'<tr><th scope="row">{ih(r)}</th><td>{ih("{{blank}}")}</td></tr>' for r in b[1])
            out.append(f'<div class="tw scroll" role="region" aria-label="Roles" tabindex="0"><table class="fill"><thead><tr><th scope="col">Role</th><th scope="col">Person</th></tr></thead><tbody>{body}</tbody></table></div>')
        elif k == "roster":
            body = "".join(f'<tr><td>{ih("{{blank}}")}</td><td>{ih("{{blank}}")}</td></tr>' for _ in range(b[1]))
            out.append(f'<div class="tw scroll" role="region" aria-label="Members" tabindex="0"><table class="fill"><caption>Members</caption><thead><tr><th scope="col">Name</th><th scope="col">Business</th></tr></thead><tbody>{body}</tbody></table></div>')
        else:
            sys.exit("unknown block " + k)
    return "\n".join("      " + x for x in out)


def page_section(s):
    num = s["num"] if len(s["num"]) > 1 else "Appendix " + s["num"]
    return (f'    <section class="topic tick" id="{s["id"]}" aria-labelledby="h-{s["id"]}">\n'
            f'      <div class="topic-head"><span class="topic-ic">{icon_svg(s["icon"])}</span>'
            f'<div><p class="topic-num">{num}</p><h2 id="h-{s["id"]}">{ih(s["title"])}</h2></div></div>\n'
            f'{page_blocks(s["blocks"])}\n'
            f'      <a class="backtop" href="#top">Back to top</a>\n    </section>')


def toc():
    rows = ['      <li><a href="#get"><i aria-hidden="true">&#8595;</i>Copy, compare, download</a></li>']
    for s in ALL:
        rows.append(f'      <li><a href="#{s["id"]}"><i>{s["num"]}</i>{html.escape(s["toc"])}</a></li>')
    return "\n".join(rows)


# ---------- Markdown ----------
def md_table(head, rows):
    def esc(t): return t.replace("|", "\\|")
    lines = ["| " + " | ".join(esc(im(h)) if h else " " for h in head) + " |", "|" + "|".join("---" for _ in head) + "|"]
    for r in rows:
        cells = []
        for c in r:
            t, kind, span = cell(c)
            cells.append(esc(im(t)) if kind != "th" else "**" + esc(im(t)) + "**")
            cells += [""] * (span - 1)
        lines.append("| " + " | ".join(cells) + " |")
    return "\n".join(lines)


def md_blocks(blocks):
    out = []
    for b in blocks:
        k = b[0]
        if k == "lead": out.append("**" + im(b[1]) + "**")
        elif k == "p": out.append(im(b[1]))
        elif k == "h3": out.append("### " + im(b[1]))
        elif k == "ul": out.append("\n".join("- " + im(x) for x in b[1]))
        elif k == "ol": out.append("\n".join(f"{i}. " + im(x) for i, x in enumerate(b[1], 1)))
        elif k == "box":
            _, tone, hd, paras = b
            out.append("> **" + im(hd) + "**\n>\n" + "\n>\n".join("> " + im(p) for p in paras))
        elif k == "kv":
            _, cap, rows = b
            x = ("**" + im(cap) + "**\n\n") if cap else ""
            out.append(x + "\n".join(f"- **{im(t)}:** {im(v)}" for t, v in rows))
        elif k == "table":
            _, cap, head, rows = b
            out.append((("**" + im(cap) + "**\n\n") if cap else "") + md_table(head, rows))
        elif k == "sig": out.append("\n".join("- Signed: ________ Date: ________" for _ in range(b[1])))
        elif k == "roles": out.append(md_table(["Role", "Person"], [[r, "{{blank}}"] for r in b[1]]))
        elif k == "roster": out.append("**Members**\n\n" + md_table(["Name", "Business"], [["{{blank}}", "{{blank}}"] for _ in range(b[1])]))
    return "\n\n".join(out)


def md_heading(s):
    return f"## {s['num']}. {s['title']}" if len(s["num"]) > 1 else f"## Appendix {s['num']}. {s['title']}"


def build_md():
    parts = [f"# {C.TITLE}", f"Version: {VER}  \nLast updated: ________", "*" + C.MOTTO + "*", INTRO_DOC]
    for s in ALL:
        parts.append(md_heading(s) + "\n\n" + md_blocks(s["blocks"]))
    parts.append("---\n\n" + C.MD_CREDIT)
    return "\n\n".join(parts) + "\n"


# ---------- Word ----------
def build_docx(path, logo_png, icon_pngs):
    from docx import Document
    from docx.enum.section import WD_SECTION
    from docx.enum.table import WD_TABLE_ALIGNMENT
    from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT, WD_BREAK
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    from docx.shared import Inches, Pt, RGBColor, Emu

    PITCH, BURN, BRICK, DEEP = "0E0E0C", "E8521A", "B83A14", "4A4038"
    TINT = {"spirit": "F6E9C9", "hard": "F8DFD3", "gap": "DCEBEA"}
    EDGE = {"spirit": "D4A832", "hard": "B83A14", "gap": "3A8A8A"}
    MONO = "Consolas"
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Inches(8.5), Inches(11)
    sec.left_margin = sec.right_margin = Inches(0.875)
    sec.top_margin, sec.bottom_margin = Inches(0.95), Inches(0.95)
    sec.header_distance = sec.footer_distance = Inches(0.45)
    sec.different_first_page_header_footer = True
    TEXT_W = 6.75

    st = doc.styles["Normal"]
    st.font.name = "Roboto"; st.font.size = Pt(10.5); st.font.color.rgb = RGBColor.from_string(PITCH)
    st.element.rPr.rFonts.set(qn("w:eastAsia"), "Roboto")
    st.paragraph_format.space_after = Pt(4); st.paragraph_format.space_before = Pt(0); st.paragraph_format.line_spacing = 1.2

    def font(run, name="Roboto", size=None, color=None, bold=None, italic=None, caps=False):
        run.font.name = name
        rpr = run._element.get_or_add_rPr()
        rf = rpr.find(qn("w:rFonts"))
        if rf is None: rf = OxmlElement("w:rFonts"); rpr.insert(0, rf)
        for a in ("w:ascii", "w:hAnsi", "w:cs", "w:eastAsia"): rf.set(qn(a), name)
        if size: run.font.size = Pt(size)
        if color: run.font.color.rgb = RGBColor.from_string(color)
        if bold is not None: run.font.bold = bold
        if italic is not None: run.font.italic = italic
        if caps: run.font.all_caps = True
        return run

    def add_inline(p, s, size=None, color=PITCH, bold_color=PITCH):
        for k, t, x in segs(s):
            if k == "blank": font(p.add_run("________"), size=size, color=color)
            elif k == "b": font(p.add_run(t), size=size, color=bold_color, bold=True)
            else: font(p.add_run(t), size=size, color=color)

    def spacing(p, before=0, after=4, keep=False):
        pf = p.paragraph_format; pf.space_before = Pt(before); pf.space_after = Pt(after)
        if keep: pf.keep_with_next = True

    def p_border(p, side, color="D4CCC0", sz=4, space=4):
        ppr = p._p.get_or_add_pPr()
        bdr = ppr.find(qn("w:pBdr"))
        if bdr is None: bdr = OxmlElement("w:pBdr"); ppr.append(bdr)
        e = OxmlElement(f"w:{side}")
        for a, v in (("w:val", "single"), ("w:sz", str(sz)), ("w:space", str(space)), ("w:color", color)): e.set(qn(a), v)
        bdr.append(e)

    def field(p, code, size, color):
        def fc(kind):
            r = font(p.add_run(), MONO, size, color)
            e = OxmlElement("w:fldChar"); e.set(qn("w:fldCharType"), kind); r._r.append(e)
        fc("begin")
        r = font(p.add_run(), MONO, size, color)
        it = OxmlElement("w:instrText"); it.set(qn("xml:space"), "preserve"); it.text = f" {code} "; r._r.append(it)
        fc("separate")
        font(p.add_run("1"), MONO, size, color)
        fc("end")

    def tbl_borders(t, color="D4CCC0", sz=4, inside=True, outer=True):
        tblPr = t._tbl.tblPr
        b = OxmlElement("w:tblBorders")
        for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
            e = OxmlElement(f"w:{side}")
            on = (inside if side.startswith("inside") else outer)
            e.set(qn("w:val"), "single" if on else "nil")
            if on:
                e.set(qn("w:sz"), str(sz)); e.set(qn("w:space"), "0"); e.set(qn("w:color"), color)
            b.append(e)
        tblPr.append(b)

    def cell_shade(c, fill):
        tcPr = c._tc.get_or_add_tcPr()
        sh = OxmlElement("w:shd"); sh.set(qn("w:val"), "clear"); sh.set(qn("w:color"), "auto"); sh.set(qn("w:fill"), fill)
        tcPr.append(sh)

    def cell_border(c, side, color, sz):
        tcPr = c._tc.get_or_add_tcPr()
        bd = tcPr.find(qn("w:tcBorders"))
        if bd is None: bd = OxmlElement("w:tcBorders"); tcPr.append(bd)
        e = OxmlElement(f"w:{side}")
        e.set(qn("w:val"), "single" if sz else "nil")
        if sz: e.set(qn("w:sz"), str(sz)); e.set(qn("w:space"), "0"); e.set(qn("w:color"), color)
        bd.append(e)

    def cell_margins(t, top=50, side=100):
        tblPr = t._tbl.tblPr
        m = OxmlElement("w:tblCellMar")
        for s_, v in (("top", top), ("left", side), ("bottom", top), ("right", side)):
            e = OxmlElement(f"w:{s_}"); e.set(qn("w:w"), str(v)); e.set(qn("w:type"), "dxa"); m.append(e)
        tblPr.append(m)

    def widths(t, ins):
        t.autofit = False
        tblPr = t._tbl.tblPr
        lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblPr.append(lay)
        for row in t.rows:
            for c, w in zip(row.cells, ins): c.width = Inches(w)
        for gc, w in zip(t._tbl.tblGrid.findall(qn("w:gridCol")), ins): gc.set(qn("w:w"), str(int(w * 1440)))

    def row_flags(row, header=False, height=None):
        trPr = row._tr.get_or_add_trPr()
        cs = OxmlElement("w:cantSplit"); trPr.append(cs)
        if header: h = OxmlElement("w:tblHeader"); trPr.append(h)
        if height:
            hh = OxmlElement("w:trHeight"); hh.set(qn("w:val"), str(int(height * 1440))); hh.set(qn("w:hRule"), "atLeast"); trPr.append(hh)

    def cell_text(c, s, size=9.5, color=PITCH, bold=False, mono=False, align=None):
        p = c.paragraphs[0]; spacing(p, 0, 0)
        if align: p.alignment = align
        if mono:
            font(p.add_run(plain(s)), MONO, size - 0.5, color, bold=bold)
        elif bold:
            font(p.add_run(plain(s)), size=size, color=color, bold=True)
        else:
            add_inline(p, s, size=size, color=color)
        return p

    def caption(s):
        p = doc.add_paragraph(); spacing(p, 6, 3, keep=True)
        font(p.add_run(plain(s).upper()), MONO, 7.5, DEEP, bold=True)

    def after_table():
        p = doc.add_paragraph(); spacing(p, 0, 4)
        p.paragraph_format.line_spacing = Pt(6)

    # headers and footers
    def footer(ft):
        p = ft.paragraphs[0]; spacing(p, 0, 0); p_border(p, "top", "D4CCC0", 4, 6)
        p.paragraph_format.tab_stops.add_tab_stop(Inches(TEXT_W), WD_TAB_ALIGNMENT.RIGHT)
        font(p.add_run(f"{C.TITLE} · {VER}"), MONO, 7, DEEP)
        font(p.add_run("\t"), MONO, 7, DEEP)
        font(p.add_run("Page "), MONO, 7, DEEP); field(p, "PAGE", 7, DEEP)
        font(p.add_run(" of "), MONO, 7, DEEP); field(p, "NUMPAGES", 7, DEEP)
        p2 = ft.add_paragraph(); spacing(p2, 0, 0)
        font(p2.add_run("A Forum Playbook resource by Colton Mulligan · forumplaybook.com"), MONO, 7, DEEP)

    footer(sec.footer); footer(sec.first_page_footer)
    hp = sec.header.paragraphs[0]; spacing(hp, 0, 0); p_border(hp, "bottom", "D4CCC0", 4, 6)
    hp.paragraph_format.tab_stops.add_tab_stop(Inches(TEXT_W), WD_TAB_ALIGNMENT.RIGHT)
    font(hp.add_run("⎇ "), MONO, 7, BURN)
    font(hp.add_run(C.TITLE.upper()), MONO, 7, PITCH, bold=True)
    font(hp.add_run("\t" + VER), MONO, 7, DEEP)
    fp = sec.first_page_header.paragraphs[0]; spacing(fp, 0, 0)
    fp.paragraph_format.tab_stops.add_tab_stop(Inches(TEXT_W), WD_TAB_ALIGNMENT.RIGHT)
    fp.add_run().add_picture(logo_png, width=Inches(1.55))
    font(fp.add_run("\t⎇ FORUM PLAYBOOK  │  " + VER), MONO, 7.5, DEEP)

    # title block
    p = doc.add_paragraph(); spacing(p, 14, 2)
    font(p.add_run("NASHVILLE FORUM "), "Roboto", 24, PITCH, bold=True)
    font(p.add_run("CONSTITUTION TEMPLATE"), "Roboto", 24, BURN, bold=True)
    p = doc.add_paragraph(); spacing(p, 2, 4)
    font(p.add_run(C.MOTTO), "Roboto", 12, PITCH, bold=True)
    p = doc.add_paragraph(); spacing(p, 0, 6)
    font(p.add_run(INTRO_DOC), "Roboto", 10.5, DEEP)
    p = doc.add_paragraph(); spacing(p, 0, 4)
    font(p.add_run(f"VERSION {VER}   │   FORUM # ________   │   LAST UPDATED ________"), MONO, 8, PITCH, bold=True)

    for s in ALL:
        p = doc.add_paragraph(); spacing(p, 16, 6, keep=True); p_border(p, "bottom", "D4CCC0", 4, 4)
        if s["id"] in BREAK_BEFORE:
            p.paragraph_format.page_break_before = True
        r = p.add_run(); r.add_picture(icon_pngs[s["icon"]], width=Inches(0.32), height=Inches(0.32))
        num = s["num"] if len(s["num"]) > 1 else "APPENDIX " + s["num"]
        font(p.add_run("  " + num + "   "), MONO, 9, BRICK, bold=True)
        font(p.add_run(s["title"].upper()), "Roboto", 14, BURN, bold=True)
        for b in s["blocks"]:
            k = b[0]
            if k == "lead":
                p = doc.add_paragraph(); spacing(p, 2, 6); font(p.add_run(plain(b[1])), size=12, color=PITCH, bold=True)
            elif k == "p":
                p = doc.add_paragraph(); spacing(p, 0, 6); add_inline(p, b[1])
            elif k == "h3":
                p = doc.add_paragraph(); spacing(p, 10, 4, keep=True); font(p.add_run(plain(b[1]).upper()), MONO, 8, BRICK, bold=True)
            elif k in ("ul", "ol"):
                for i, x in enumerate(b[1], 1):
                    p = doc.add_paragraph(); spacing(p, 0, 4)
                    p.paragraph_format.left_indent = Inches(0.3); p.paragraph_format.first_line_indent = Inches(-0.22)
                    p.paragraph_format.tab_stops.add_tab_stop(Inches(0.3))
                    if k == "ul": font(p.add_run("•\t"), size=10.5, color=BRICK, bold=True)
                    else: font(p.add_run(f"{i}.\t"), size=10.5, color=BRICK, bold=True)
                    add_inline(p, x)
            elif k == "box":
                _, tone, hd, paras = b
                t = doc.add_table(rows=1, cols=1); tbl_borders(t, "D4CCC0", 4, inside=False); cell_margins(t, 90, 160); widths(t, [TEXT_W])
                c = t.rows[0].cells[0]; cell_shade(c, TINT[tone]); cell_border(c, "left", EDGE[tone], 24); row_flags(t.rows[0])
                p = c.paragraphs[0]; spacing(p, 0, 3); font(p.add_run(plain(hd).upper()), MONO, 7.5, PITCH, bold=True)
                for x in paras:
                    p = c.add_paragraph(); spacing(p, 0, 3); add_inline(p, x, size=10)
                after_table()
            elif k == "kv":
                _, cap, rows = b
                if cap: caption(cap)
                t = doc.add_table(rows=0, cols=2); tbl_borders(t); cell_margins(t)
                for term, v in rows:
                    row = t.add_row(); row_flags(row)
                    cell_text(row.cells[0], term, bold=True); cell_text(row.cells[1], v)
                widths(t, [2.1, TEXT_W - 2.1]); after_table()
            elif k == "table":
                _, cap, head, rows = b
                if cap: caption(cap)
                n = len(head)
                t = doc.add_table(rows=1, cols=n); tbl_borders(t); cell_margins(t)
                row_flags(t.rows[0], header=True)
                for c, h in zip(t.rows[0].cells, head):
                    cell_shade(c, "E8E2D6"); cell_text(c, h.upper(), size=7.5, mono=True, bold=True)
                for r in rows:
                    row = t.add_row(); row_flags(row)
                    ci = 0
                    for c in r:
                        txt, kind, span = cell(c)
                        target = row.cells[ci]
                        if span > 1: target = target.merge(row.cells[ci + span - 1])
                        if kind == "th": cell_text(target, txt, bold=True)
                        elif kind == "n": cell_text(target, txt, mono=True)
                        elif kind == "fine": cell_text(target, txt, mono=True, bold=True)
                        elif kind in ("none", "ok"): cell_text(target, txt, mono=True, color=DEEP)
                        elif kind == "miss": cell_shade(target, "F6E9C9"); cell_text(target, txt, mono=True)
                        elif kind == "out": cell_shade(target, "F8DFD3"); cell_text(target, txt, mono=True, bold=True)
                        else: cell_text(target, txt)
                        ci += span
                if n == 2: w = [2.6, TEXT_W - 2.6]
                elif head[0] == "#": w = [0.45, TEXT_W - 0.45 - 1.7, 1.7]
                elif head[0] == "": w = [1.35, (TEXT_W - 1.35) / 2, (TEXT_W - 1.35) / 2]
                elif head[1] == "Fine": w = [TEXT_W - 1.45 - 1.6, 1.45, 1.6]
                else: w = [TEXT_W - 2.2 - 1.3, 2.2, 1.3]
                widths(t, w); after_table()
            elif k == "sig":
                t = doc.add_table(rows=0, cols=4); tbl_borders(t, inside=False, outer=False); cell_margins(t, 40, 60)
                for _ in range(b[1]):
                    row = t.add_row(); row_flags(row, height=0.5)
                    for i, c in enumerate(row.cells):
                        c.vertical_alignment = 3  # bottom
                        if i in (0, 2): cell_text(c, "SIGNED" if i == 0 else "DATE", size=8, mono=True, color=DEEP)
                        else: cell_border(c, "bottom", PITCH, 6)
                widths(t, [0.75, 3.8, 0.6, 1.6]); after_table()
            elif k == "roles":
                t = doc.add_table(rows=1, cols=2); tbl_borders(t); cell_margins(t, 70, 100)
                row_flags(t.rows[0], header=True)
                for c, h in zip(t.rows[0].cells, ("ROLE", "PERSON")): cell_shade(c, "E8E2D6"); cell_text(c, h, size=7.5, mono=True, bold=True)
                for r in b[1]:
                    row = t.add_row(); row_flags(row, height=0.34); cell_text(row.cells[0], r, bold=True)
                widths(t, [3.0, TEXT_W - 3.0]); after_table()
            elif k == "roster":
                caption("Members")
                t = doc.add_table(rows=1, cols=2); tbl_borders(t); cell_margins(t, 70, 100)
                row_flags(t.rows[0], header=True)
                for c, h in zip(t.rows[0].cells, ("NAME", "BUSINESS")): cell_shade(c, "E8E2D6"); cell_text(c, h, size=7.5, mono=True, bold=True)
                for _ in range(b[1]):
                    row = t.add_row(); row_flags(row, height=0.34)
                widths(t, [TEXT_W / 2, TEXT_W / 2]); after_table()
    doc.core_properties.title = C.TITLE + " " + VER
    doc.core_properties.author = "Colton Mulligan, Forum Playbook"
    doc.core_properties.comments = C.CREDIT
    doc.save(path)


# ---------- PDF (print HTML through headless Chrome) ----------
def print_blocks(blocks):
    """The page's block HTML minus page-only bits (links become plain text, tables lose the scroll frame)."""
    h = page_blocks(blocks)
    h = re.sub(r'<a href="#[^"]+">(.*?)</a>', r"\1", h)
    h = re.sub(r'class="tw scroll( wide)?" role="region"', 'class="tw"', h).replace(' tabindex="0"', "")
    return h


def build_print_html(logo_path, icon_files):
    secs = []
    for s in ALL:
        num = s["num"] if len(s["num"]) > 1 else "Appendix " + s["num"]
        brk = " brk" if s["id"] in BREAK_BEFORE else ""
        secs.append(f'<section class="topic{brk}" id="p-{s["id"]}"><h2><img src="file://{icon_files[s["icon"]]}" alt=""><span class="n">{num}</span>'
                    f'<span class="t">{html.escape(s["title"])}</span></h2>\n{print_blocks(s["blocks"])}\n</section>')
    foot_l = f"{C.TITLE} \u00b7 {VER}\\A A Forum Playbook resource by Colton Mulligan \u00b7 forumplaybook.com"
    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>{C.TITLE} {VER}</title>
<link rel="stylesheet" href="file://{os.path.join(ROOT, 'fonts', 'fonts.css')}">
<style>
@page {{ size: 8.5in 11in; margin: 0.95in 0.875in 0.95in 0.875in;
  @top-left {{ content: "\\2387  {C.TITLE.upper()}"; font: 700 7pt Menlo, Consolas, monospace; color: #0E0E0C; vertical-align: bottom; padding-bottom: 8pt; margin-bottom: 12pt; border-bottom: 0.5pt solid #D4CCC0; }}
  @top-right {{ content: "{VER}"; font: 400 7pt Menlo, Consolas, monospace; color: #4A4038; vertical-align: bottom; padding-bottom: 8pt; margin-bottom: 12pt; border-bottom: 0.5pt solid #D4CCC0; }}
  @bottom-left {{ content: "{foot_l}"; white-space: pre; font: 400 7pt/1.45 Menlo, Consolas, monospace; color: #4A4038; vertical-align: top; padding-top: 8pt; margin-top: 12pt; border-top: 0.5pt solid #D4CCC0; }}
  @bottom-right {{ content: "Page " counter(page) " of " counter(pages); font: 400 7pt Menlo, Consolas, monospace; color: #4A4038; vertical-align: top; padding-top: 8pt; margin-top: 12pt; border-top: 0.5pt solid #D4CCC0; }}
}}
@page :first {{ margin-top: 0.6in; @top-left {{ content: none; border: 0; }} @top-right {{ content: none; border: 0; }} }}
* {{ box-sizing: border-box; }}
html, body {{ margin: 0; }}
body {{ font: 400 10.5pt/1.32 Roboto, Helvetica, Arial, sans-serif; color: #0E0E0C; -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
.top {{ display: flex; justify-content: space-between; align-items: center; margin: 0 0 14pt; }}
.top img {{ width: 1.55in; height: auto; display: block; }}
.top span {{ font: 400 7.5pt Menlo, Consolas, monospace; color: #4A4038; letter-spacing: .04em; }}
h1 {{ font: 700 24pt/1.05 Roboto, sans-serif; margin: 0 0 4pt; text-transform: uppercase; }}
h1 b {{ color: #E8521A; }}
.motto {{ font: 700 12pt/1.3 Roboto, sans-serif; margin: 0 0 4pt; }}
.intro {{ color: #4A4038; margin: 0 0 6pt; }}
.meta {{ font: 700 8pt Menlo, Consolas, monospace; letter-spacing: .04em; margin: 0 0 4pt; }}
.topic {{ break-before: auto; }}
.topic.brk {{ break-before: page; }}
h2 {{ display: flex; align-items: center; gap: 8pt; margin: 16pt 0 6pt; padding-bottom: 4pt; border-bottom: 0.5pt solid #D4CCC0; break-after: avoid; }}
h2 img {{ width: 0.32in; height: 0.32in; }}
h2 .n {{ font: 700 9pt Menlo, Consolas, monospace; color: #B83A14; }}
h2 .t {{ font: 700 14pt/1.1 Roboto, sans-serif; color: #E8521A; text-transform: uppercase; }}
h3 {{ font: 700 8pt Menlo, Consolas, monospace; color: #B83A14; text-transform: uppercase; letter-spacing: .04em; margin: 10pt 0 4pt; break-after: avoid; }}
p {{ margin: 0 0 6pt; }}
p.lead {{ font-weight: 700; font-size: 12pt; }}
ul, ol {{ margin: 0 0 6pt; padding-left: 0.3in; }}
li {{ margin: 0 0 4pt; }}
ul li::marker {{ color: #B83A14; }}
ol.ladder li::marker {{ color: #B83A14; font-weight: 700; }}
.box {{ background: #F6E9C9; border: 0.5pt solid #D4CCC0; border-left: 3pt solid #D4A832; padding: 7pt 11pt; margin: 0 0 8pt; break-inside: avoid; font-size: 10pt; }}
.box.hard {{ background: #F8DFD3; border-left-color: #B83A14; }}
.box.gap {{ background: #DCEBEA; border-left-color: #3A8A8A; }}
.box .hd {{ font: 700 7.5pt Menlo, Consolas, monospace; text-transform: uppercase; margin: 0 0 3pt; }}
.box p {{ margin: 0 0 3pt; }} .box p:last-child {{ margin: 0; }}
.tw {{ margin: 0 0 8pt; break-inside: avoid; }}
#p-roles .tw {{ break-inside: auto; }}
thead, caption, tbody tr:first-child {{ break-after: avoid; }}
#p-appendix-b {{ break-inside: avoid; }}
.topic > p {{ orphans: 3; widows: 3; }}
h2 + p {{ break-before: avoid; }}
table {{ width: 100%; border-collapse: collapse; font-size: 9.5pt; line-height: 1.3; }}
caption {{ caption-side: top; text-align: left; font: 700 7.5pt Menlo, Consolas, monospace; color: #4A4038; text-transform: uppercase; padding: 4pt 0 3pt; }}
th, td {{ border: 0.5pt solid #D4CCC0; padding: 3.5pt 6pt; text-align: left; vertical-align: top; }}
thead th {{ background: #E8E2D6; font: 700 7pt Menlo, Consolas, monospace; text-transform: uppercase; }}
thead {{ display: table-header-group; }}
tr {{ break-inside: avoid; }}
tbody th {{ width: 31%; font-weight: 700; }}
td.n, td.fine, td.none, td.ok, .chip {{ font-family: Menlo, Consolas, monospace; font-size: 8.5pt; }}
td.n {{ white-space: nowrap; }}
td.fine {{ font-weight: 700; }}
td.none, td.ok {{ color: #4A4038; }}
td:has(.chip.miss) {{ background: #F6E9C9; }}
td:has(.chip.out) {{ background: #F8DFD3; font-weight: 700; }}
.chip.out {{ font-weight: 700; }}
.blank {{ display: inline-block; min-width: 1.2in; border-bottom: 0.75pt solid #0E0E0C; height: 1em; vertical-align: -2pt; }}
.blank.short {{ min-width: 0.35in; }}
.fill .blank {{ border: 0; }}
.sr {{ display: none; }}
.sig {{ margin: 6pt 0 8pt; }}
.sigrow {{ display: flex; align-items: flex-end; gap: 10pt; height: 0.5in; }}
.sigrow span {{ font: 400 8pt Menlo, Consolas, monospace; color: #4A4038; text-transform: uppercase; }}
.sigline {{ flex: 1; border-bottom: 0.75pt solid #0E0E0C; height: 1px; }}
.sigdate {{ width: 1.6in; border-bottom: 0.75pt solid #0E0E0C; height: 1px; }}
.fill td {{ height: 0.34in; }}
</style></head><body>
<div class="top"><img src="file://{logo_path}" alt="EO Nashville"><span>&#9095; FORUM PLAYBOOK &#9474; {VER}</span></div>
<h1>Nashville Forum <b>Constitution Template</b></h1>
<p class="motto">{html.escape(C.MOTTO)}</p>
<p class="intro">{html.escape(INTRO_DOC)}</p>
<p class="meta">VERSION {VER} &nbsp;&#9474;&nbsp; FORUM # ________ &nbsp;&#9474;&nbsp; LAST UPDATED ________</p>
{chr(10).join(secs)}
</body></html>"""


# ---------- build ----------
from PIL import Image  # noqa: E402

os.makedirs(os.path.join(D, "img"), exist_ok=True)
logo = Image.open(LOGO_SRC).convert("RGBA")
logo = logo.crop(logo.getchannel("A").getbbox())
pad = int(logo.height * 0.04)
canvas = Image.new("RGBA", (logo.width + 2 * pad, logo.height + 2 * pad), (0, 0, 0, 0)); canvas.paste(logo, (pad, pad))
web = canvas.resize((680, round(680 * canvas.height / canvas.width)), Image.LANCZOS)
LOGO_WEB = os.path.join(D, "img", "eo-nashville-logo.png"); web.save(LOGO_WEB, optimize=True)
LOGO_H = round(170 * web.height / web.width)

tmp = tempfile.mkdtemp(prefix="constitution-build-")
logo_doc = os.path.join(tmp, "logo-doc.png")
flat = Image.new("RGB", canvas.size, (255, 255, 255)); flat.paste(canvas, mask=canvas.getchannel("A"))
flat.resize((900, round(900 * canvas.height / canvas.width)), Image.LANCZOS).save(logo_doc)

# concept icons as PNG for the documents: thin Pitch lines, cached per name
cache = os.path.expanduser("~/.cache/forum-playbook-icons"); os.makedirs(cache, exist_ok=True)
icon_pngs = {}
for s in ALL:
    out = os.path.join(cache, f"{s['icon']}-thin-0E0E0C-192.png")
    if not os.path.exists(out):
        svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="192" height="192">'
               f'<g style="color:#0E0E0C">{ph.body(s["icon"], "thin")}</g></svg>')
        ph.render_png(svg, 192, out, bg=None)
    icon_pngs[s["icon"]] = out
if len(set(s["icon"] for s in ALL)) != len(ALL): sys.exit("guard failed: an icon is used for two topics")

# Markdown and the texts the copy buttons carry
MD = build_md()
PROMPT = PROMPT_HEAD + "\n\nTEMPLATE:\n\n" + MD + "\n" + PROMPT_TAIL
open(os.path.join(D, MD_FILE), "w").write(MD)

# the page
src = open(os.path.join(D, "_src", "index.html")).read()
chrome_copy = src  # the page's own words, before the constitution goes in: the promise-word guard reads this
s = src
s = re.sub(r"\{\{IC_SM:([a-z0-9-]+)\}\}", lambda m: icon_svg(m.group(1), 22), s)
s = re.sub(r"\{\{IC:([a-z0-9-]+)\}\}", lambda m: icon_svg(m.group(1), 48), s)
s = s.replace("{{STAMP}}", STAMP).replace("{{STAMPDATE}}", STAMP.replace("Updated ", ""))
s = s.replace("{{VERSION}}", VER).replace("{{LOGO_H}}", str(LOGO_H))
s = s.replace("{{MD_FILE}}", MD_FILE).replace("{{DOCX_FILE}}", DOCX_FILE).replace("{{PDF_FILE}}", PDF_FILE)
s = s.replace("{{CREDIT_HTML}}", html.escape(C.CREDIT, quote=False).replace("forumplaybook.com", '<a href="/">forumplaybook.com</a>'))
s = re.sub(r'<nav class="cfoot-nav".*?</nav>', bc.footer_nav("/constitution/"), s, count=1, flags=re.S)
s = s.replace("{{TOC}}", toc())
s = s.replace("{{SECTIONS}}", "\n".join(page_section(x) for x in ALL))
s = s.replace("{{PROMPT_HTML}}", html.escape(PROMPT, quote=False))
s = s.replace("{{DATA_JSON}}", json.dumps({"md": MD, "prompt": PROMPT}, ensure_ascii=False).replace("</", "<\\/"))
s = s.replace("</body>", bc.COUNTER + "\n</body>", 1)

# guards on the page
if EMDASH in s: sys.exit("guard failed: em dash in the page")
left = re.findall(r"\{\{[^}]*\}\}", s)
if left: sys.exit("guard failed: leftover tokens " + ", ".join(left[:5]))
PROMISES = ["guarantee", "guaranteed", "never ", "always ", "forever", "100%", "any time you want", "no questions asked", "we will", "you will get", "will find", "will show"]
copy_text = re.sub(r"<[^>]+>", " ", re.sub(r"<(script|style)\b.*?</\1>", " ", chrome_copy, flags=re.S)).lower()
hits = [w for w in PROMISES if w in copy_text]
if hits: sys.exit("guard failed: promise words in the page copy " + ", ".join(hits))
for m in re.finditer(r'<a [^>]*href="(https?://[^"]+)"[^>]*>', s):
    if 'target="_blank"' not in m.group(0) or 'rel="noopener"' not in m.group(0):
        sys.exit("guard failed: off-site link without target=_blank rel=noopener: " + m.group(1))
for href in re.findall(r'href="/constitution/([^"#?]+)"', s):
    if not href.endswith("/") and not os.path.exists(os.path.join(D, href)) and href not in (DOCX_FILE, PDF_FILE):
        sys.exit("guard failed: the page links a file that is not there: " + href)
ids = set(re.findall(r'id="([^"]+)"', s))
for a in re.findall(r'href="#([^"]+)"', s):
    if a not in ids: sys.exit("guard failed: in-page link to a missing anchor #" + a)
open(os.path.join(D, "index.html"), "w").write(s)

# the Word document
build_docx(os.path.join(D, DOCX_FILE), logo_doc, icon_pngs)

# the PDF
ph_html = os.path.join(tmp, "print.html")
open(ph_html, "w").write(build_print_html(logo_doc, icon_pngs))
pdf = os.path.join(D, PDF_FILE)
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-pdf-header-footer", "--virtual-time-budget=10000",
                "--run-all-compositor-stages-before-draw", f"--print-to-pdf={pdf}", f"file://{ph_html}"],
               stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL, check=True)
pages = int(re.search(r"Pages:\s+(\d+)", subprocess.check_output(["/opt/homebrew/bin/pdfinfo", pdf], text=True)).group(1))

# preview: page one of the PDF, about 1000 px wide
os.makedirs(os.path.dirname(PREVIEW), exist_ok=True)
stem = os.path.join(tmp, "preview")
subprocess.run([PDFTOPPM, "-png", "-f", "1", "-l", "1", "-singlefile", "-scale-to-x", "1000", "-scale-to-y", "-1", pdf, stem], check=True)
shutil.copyfile(stem + ".png", PREVIEW)

# og.png, 1200 x 630, from og.html (the version on it follows VERSION)
og_html = os.path.join(D, "og.html")
og = open(og_html).read()
og2 = re.sub(r"V\d{4}\.\d{2}\.\d{2}", VER, og)
if og2 != og: open(og_html, "w").write(og2)
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--window-size=1200,630",
                "--virtual-time-budget=6000", f"--screenshot={os.path.join(D, 'og.png')}", f"file://{og_html}"],
               stderr=subprocess.DEVNULL, check=True)

# guards on the files
with zipfile.ZipFile(os.path.join(D, DOCX_FILE)) as z:
    docx_xml = "".join(z.read(n).decode("utf8") for n in z.namelist() if n.endswith(".xml"))
pdf_text = subprocess.check_output(["/opt/homebrew/bin/pdftotext", pdf, "-"], text=True)
for name, text in (("Markdown", MD), ("Word", docx_xml), ("PDF", pdf_text), ("og.html", og2), ("constitution.css", open(os.path.join(D, "constitution.css")).read()),
                   ("content.py", open(os.path.join(D, "_src", "content.py")).read()), ("this builder", open(os.path.abspath(__file__)).read())):
    if EMDASH in text: sys.exit(f"guard failed: em dash in {name}")
embedded = json.loads(re.search(r'<script id="cx-data" type="application/json">(.*?)</script>', s, re.S).group(1).replace("<\\/", "</"))
if embedded["md"] != open(os.path.join(D, MD_FILE)).read(): sys.exit("guard failed: the copy button's text differs from the Markdown file")
if not embedded["prompt"].startswith(PROMPT_HEAD) or MD not in embedded["prompt"]: sys.exit("guard failed: the compare prompt does not carry the Markdown")
for f in (MD_FILE, DOCX_FILE, PDF_FILE, "og.png", "img/eo-nashville-logo.png"):
    if not os.path.getsize(os.path.join(D, f)): sys.exit("guard failed: empty file " + f)
for href in re.findall(r'href="/constitution/([^"#?]+)"', s):
    if not href.endswith("/") and not os.path.exists(os.path.join(D, href)): sys.exit("guard failed: missing download " + href)
for s_ in ALL:  # every topic title reaches every output
    for name, text in (("Markdown", MD), ("PDF", re.sub(r"\s+", " ", pdf_text).upper())):
        want = s_["title"] if name == "Markdown" else s_["title"].upper()
        if want not in text: sys.exit(f"guard failed: {s_['title']} is missing from the {name}")

shutil.rmtree(tmp, ignore_errors=True)
print(f"built constitution/index.html {STAMP} | {VER} | topics: {len(ALL)} | PDF pages: {pages}")
print(f"  {MD_FILE} ({os.path.getsize(os.path.join(D, MD_FILE)) // 1024} KB), {DOCX_FILE} ({os.path.getsize(os.path.join(D, DOCX_FILE)) // 1024} KB), {PDF_FILE} ({os.path.getsize(pdf) // 1024} KB)")
print("  previews/nashville-forum-constitution-template.png, constitution/og.png")
