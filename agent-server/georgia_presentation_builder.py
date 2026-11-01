#!/usr/bin/env python3
"""
Professional Presentation Generator for Georgia Tours 2027.
Generates native .pptx files and interactive executive HTML5 decks.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE


def hex_to_rgb(hex_str: str) -> RGBColor:
    hex_str = hex_str.lstrip('#')
    return RGBColor(*(int(hex_str[i:i+2], 16) for i in (0, 2, 4)))


# Palette: Elegant Georgia Wine & Mountain Theme
COLOR_BG = hex_to_rgb("0F172A")       # Deep Slate Dark
COLOR_CARD = hex_to_rgb("1E293B")     # Card Surface
COLOR_WINE = hex_to_rgb("991B1B")     # Georgian Saperavi Red
COLOR_GOLD = hex_to_rgb("F59E0B")     # Amber / Kakhetian Gold
COLOR_TEXT_LIGHT = hex_to_rgb("F8FAFC")
COLOR_TEXT_MUTED = hex_to_rgb("94A3B8")
COLOR_BORDER = hex_to_rgb("334155")


def create_pptx_deck(output_path: str, selected_concept: str = "Гранд-тур: Вся Грузия 2027") -> str:
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Helper: add dark background
    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = COLOR_BG
        bg.line.fill.background()
        return bg

    # Helper: add header bar
    def add_header(slide, title: str, category: str = "ГРУЗИЯ 2027 · ЭКСКЛЮЗИВНЫЕ ТУРЫ"):
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.733), Inches(1.2))
        tf = tb.text_frame
        tf.word_wrap = True
        
        p_cat = tf.paragraphs[0]
        p_cat.text = category.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = COLOR_GOLD

        p_title = tf.add_paragraph()
        p_title.text = title
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT_LIGHT

    # Helper: add card
    def add_card(slide, left, top, width, height, title, items, badge=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = COLOR_CARD
        card.line.color.rgb = COLOR_BORDER
        card.line.width = Pt(1)

        tb = slide.shapes.add_textbox(left + Inches(0.2), top + Inches(0.2), width - Inches(0.4), height - Inches(0.4))
        tf = tb.text_frame
        tf.word_wrap = True

        if badge:
            p_badge = tf.paragraphs[0]
            p_badge.text = badge.upper()
            p_badge.font.size = Pt(10)
            p_badge.font.bold = True
            p_badge.font.color.rgb = COLOR_GOLD
            p_title = tf.add_paragraph()
        else:
            p_title = tf.paragraphs[0]

        p_title.text = title
        p_title.font.size = Pt(18)
        p_title.font.bold = True
        p_title.font.color.rgb = COLOR_TEXT_LIGHT

        for it in items:
            p = tf.add_paragraph()
            p.text = "• " + it
            p.font.size = Pt(13)
            p.font.color.rgb = COLOR_TEXT_MUTED
            p.space_before = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 1: Cover Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    add_bg(s1)

    # Accent bar
    accent = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.8), Inches(0.15), Inches(3.2))
    accent.fill.solid()
    accent.fill.fore_color.rgb = COLOR_WINE
    accent.line.fill.background()

    tb1 = s1.shapes.add_textbox(Inches(1.2), Inches(1.7), Inches(11.0), Inches(3.5))
    tf1 = tb1.text_frame
    tf1.word_wrap = True

    p_badge = tf1.paragraphs[0]
    p_badge.text = "ЭКСКЛЮЗИВНАЯ КОЛЛЕКЦИЯ СЕЗОНА 2027 🇬🇪"
    p_badge.font.size = Pt(13)
    p_badge.font.bold = True
    p_badge.font.color.rgb = COLOR_GOLD

    p1 = tf1.add_paragraph()
    p1.text = "Грузия 2027: Авторские Туры"
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = COLOR_TEXT_LIGHT
    p1.space_before = Pt(8)

    p2 = tf1.add_paragraph()
    p2.text = f"Основная концепция: {selected_concept}\nОт древних виноделен Кахетии до ледников Казбеги и панорам Сванетии."
    p2.font.size = Pt(18)
    p2.font.color.rgb = COLOR_TEXT_MUTED
    p2.space_before = Pt(14)

    # Footer note
    ft = s1.shapes.add_textbox(Inches(1.2), Inches(6.0), Inches(10), Inches(0.8))
    ft_p = ft.text_frame.paragraphs[0]
    ft_p.text = "Подготовлено персональным ассистентом Mika (AGY) для Катеньки 🐱✨ | Бронирование сезона 2027"
    ft_p.font.size = Pt(12)
    ft_p.font.color.rgb = COLOR_GOLD

    # -------------------------------------------------------------
    # SLIDE 2: Executive Summary & Highlights 2027
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    add_bg(s2)
    add_header(s2, "Концепция Сезона 2027: Почему Грузия?")

    add_card(s2, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "🍷 Винный Ренессанс",
             [
                 "8000 лет непрерывного виноделия в квеври.",
                 "Эксклюзивный доступ в закрытые шато Кахетии.",
                 "Дегустации раритетных вин Саперави и Ркацители.",
                 "Праздник сбора урожая Ртвели с участием гостей."
             ], badge="Гастрономия & Традиции")

    add_card(s2, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "🏔 Кавказские Вершины",
             [
                 "Степанцминда и гергетская церковь у Казбека (5033 м).",
                 "Средневековые родовые башни Местии и Ушгули.",
                 "Легкие треккинги с панорамными видами Кавказа.",
                 "Премиальные эко-лоджи Rooms Hotel Kazbegi."
             ], badge="Горы & Приключения")

    add_card(s2, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "🏰 Комфорт & Премиум",
             [
                 "Индивидуальный транспорт (Mercedes Sprinter VIP).",
                 "Лучшие бутик-отели Тбилиси, Телави и Батуми.",
                 "Личный шеф-повар и экспертные гиды-историки.",
                 "Круглосуточный консьерж-сервис 24/7."
             ], badge="Сервис & Безопасность")

    # -------------------------------------------------------------
    # SLIDE 3: Key Itineraries 2027
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    add_bg(s3)
    add_header(s3, "Флагманские Маршруты 2027 Года")

    add_card(s3, Inches(0.8), Inches(2.0), Inches(5.6), Inches(4.8),
             "Маршрут А: «Душа Кахетии & Тбилиси» (5 дней)",
             [
                 "День 1: Прибытие в Тбилиси, вечерний фуникулер, серные бани Абанотубани.",
                 "День 2: Авторская пешая прогулка по старому Тбилиси, фасадным балконам и арт-галереям.",
                 "День 3: Выезд в Кахетию, город любви Сигнахи, частная винодельня с дегустацией.",
                 "День 4: Алазанская долина, замок Греми, ужин с шеф-поваром в усадьбе Цинандали.",
                 "День 5: Мастер-класс по выпечке шоти и чурчхелы, возвращение в Тбилиси."
             ], badge="Винно-Гастрономический")

    add_card(s3, Inches(6.8), Inches(2.0), Inches(5.6), Inches(4.8),
             "Маршрут B: «Казбеги & Высокогорная Сванетия» (7 дней)",
             [
                 "День 1-2: Военно-Грузинская дорога, крепость Ананури, арка Дружбы, закат над Казбеком.",
                 "День 3: Джип-тур в ущелье Трусо и высокогорные минеральные источники.",
                 "День 4-5: Перелет / трансфер в Сванетию, музей Михаила Хергиани, башни Местии.",
                 "День 6: Экспедиция в самое высокогорное село Европы — Ушгули (2200 м).",
                 "День 7: Видовой спуск к Черному морю в Батуми или возвращение в Тбилиси."
             ], badge="Горный & Экспедиционный")

    # -------------------------------------------------------------
    # SLIDE 4: Season Calendar 2027
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    add_bg(s4)
    add_header(s4, "Сезонный Календарь Туров 2027")

    add_card(s4, Inches(0.8), Inches(2.0), Inches(2.7), Inches(4.8),
             "🌸 Весна 2027",
             [
                 "Апрель — Май",
                 "Цветущие сады Картли.",
                 "Идеально для прогулок по Тбилиси (+22°C).",
                 "Пасхальные праздники.",
                 "Молодые вина нового урожая."
             ], badge="Цветение & Культура")

    add_card(s4, Inches(3.8), Inches(2.0), Inches(2.7), Inches(4.8),
             "☀️ Лето 2027",
             [
                 "Июнь — Август",
                 "Прохлада Кавказских гор.",
                 "Открыты перевалы в Сванетию и Тушетию.",
                 "Музыкальные фестивали в Батуми.",
                 "Купальный сезон на море."
             ], badge="Горы & Побережье")

    add_card(s4, Inches(6.8), Inches(2.0), Inches(2.7), Inches(4.8),
             "🍇 Осень 2027",
             [
                 "Сентябрь — Октябрь",
                 "Сезон РТВЕЛИ (сбор винограда).",
                 "Золотая осень в горах.",
                 "Тбилисоба (главный праздник города).",
                 "Бархатный сезон в Аджарии."
             ], badge="Пик Сезона")

    add_card(s4, Inches(9.8), Inches(2.0), Inches(2.7), Inches(4.8),
             "❄️ Зима 2027",
             [
                 "Декабрь — Февраль",
                 "Горнолыжный курорт Гудаури.",
                 "Фрирайд и хели-ски.",
                 "Новогодний Тбилиси в огнях.",
                 "Горячие серные бани и хачапури."
             ], badge="Снег & Зимний Драйв")

    # -------------------------------------------------------------
    # SLIDE 5: Packages & Pricing
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    add_bg(s5)
    add_header(s5, "Пакеты Услуг и Тарифы 2027")

    add_card(s5, Inches(0.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Comfort Explorer",
             [
                 "$1,250 / чел (группа 6-10)",
                 "Отели 4★ с завтраками.",
                 "Комфортный микроавтобус.",
                 "Все входные билеты и гид.",
                 "3 главные дегустации вин.",
                 "Трансфер из/в аэропорт."
             ], badge="Популярный выбор")

    add_card(s5, Inches(4.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "VIP Boutique & Wine",
             [
                 "$2,400 / чел (мини-группа 4-6)",
                 "Отели 5★ (Rooms, Radisson, Tsinandali).",
                 "Mercedes V-Class VIP трансфер.",
                 "Все обеды и ужины в лучших ресторанах.",
                 "Приватные встречи с владельцами шато.",
                 "Индивидуальный консьерж 24/7."
             ], badge="Премиум Сегмент")

    add_card(s5, Inches(8.8), Inches(2.0), Inches(3.6), Inches(4.8),
             "Bespoke Luxury",
             [
                 "От $4,500 / чел (по запросу)",
                 "Полностью индивидуальный сценарий.",
                 "Вертолетные заброски в горы Казбеги.",
                 "Закрытые дегустации вин вековой выдержки.",
                 "Шеф-повар со звездой Michelin.",
                 "Охрана и персональный ассистент."
             ], badge="Эксклюзив")

    # -------------------------------------------------------------
    # SLIDE 6: Contact & Next Steps
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    add_bg(s6)
    add_header(s6, "Контакты и Раннее Бронирование 2027")

    add_card(s6, Inches(1.5), Inches(2.0), Inches(10.3), Inches(4.8),
             "Готовы открыть настоящую Грузию вместе с нами?",
             [
                 "Раннее бронирование сезона 2027 открыто до 31 декабря 2026 года со скидкой 15%.",
                 "Возможность фиксации стоимости в договоре без скрытых доплат.",
                 "Индивидуальная адаптация программы под пожелания вашей группы.",
                 "Организация корпоративных выездов, свадеб и закрытых ретритов в горах.",
                 "",
                 "📞 Телефон / WhatsApp / Telegram: +995 (555) 00-2027",
                 "✉️ Email: tours2027@georgia-travel.com",
                 "🌐 Веб-сайт: https://georgia-tours2027.com",
                 "",
                 "Презентация создана персональным ассистентом Mika (AGY) специально для Катеньки! 🐱🐾💖"
             ], badge="Бронирование 2027")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    prs.save(output_path)
    return output_path


def create_html_deck(output_path: str, selected_concept: str = "Гранд-тур: Вся Грузия 2027") -> str:
    html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Грузия 2027 · Авторские Туры</title>
    <style>
        :root {{
            --bg: #090d16;
            --surface: #131b2e;
            --card: #1c2744;
            --wine: #991b1b;
            --wine-glow: rgba(153, 27, 27, 0.4);
            --gold: #f59e0b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: rgba(255, 255, 255, 0.08);
            --font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif;
        }}
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background: var(--bg);
            color: var(--text-main);
            font-family: var(--font);
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            padding: 30px 20px;
        }}
        .deck-container {{
            max-width: 1080px;
            width: 100%;
        }}
        .deck-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border);
        }}
        .cat-badge {{
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(245, 158, 11, 0.15);
            color: var(--gold);
            border: 1px solid rgba(245, 158, 11, 0.3);
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 600;
        }}
        .controls {{
            display: flex;
            gap: 10px;
        }}
        .btn {{
            background: var(--card);
            color: var(--text-main);
            border: 1px solid var(--border);
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }}
        .btn:hover {{ background: #253358; border-color: var(--gold); }}
        .slide {{
            display: none;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 40px;
            min-height: 540px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            animation: fadeIn 0.3s ease-in-out;
        }}
        .slide.active {{ display: block; }}
        @keyframes fadeIn {{ from {{ opacity: 0; transform: translateY(8px); }} to {{ opacity: 1; transform: translateY(0); }} }}
        h1 {{ font-size: 42px; font-weight: 800; margin-bottom: 16px; color: var(--text-main); }}
        h2 {{ font-size: 28px; font-weight: 700; margin-bottom: 24px; color: var(--gold); }}
        .subtitle {{ font-size: 18px; color: var(--text-muted); line-height: 1.6; margin-bottom: 30px; }}
        .grid-3 {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }}
        .grid-2 {{ display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }}
        .grid-4 {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px; }}
        .card {{
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 14px;
            padding: 22px;
            transition: transform 0.2s;
        }}
        .card:hover {{ transform: translateY(-4px); border-color: rgba(245, 158, 11, 0.4); }}
        .card h3 {{ font-size: 18px; margin-bottom: 12px; color: var(--text-main); }}
        .card ul {{ list-style: none; }}
        .card li {{ color: var(--text-muted); font-size: 13.5px; margin-bottom: 8px; line-height: 1.5; position: relative; padding-left: 18px; }}
        .card li::before {{ content: "•"; position: absolute; left: 0; color: var(--gold); font-weight: bold; }}
        .card-badge {{ font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--gold); margin-bottom: 8px; display: inline-block; }}
        .slide-footer {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 30px;
            padding-top: 16px;
            border-top: 1px solid var(--border);
            font-size: 13px;
            color: var(--text-muted);
        }}
        .accent-wine {{ color: #ef4444; }}
    </style>
</head>
<body>
    <div class="deck-container">
        <div class="deck-header">
            <div class="cat-badge">🐱 Mika AGY Presentation Studio · Создано для Катеньки</div>
            <div class="controls">
                <button class="btn" onclick="prevSlide()">◀ Назад</button>
                <span id="slideIndicator" style="display:flex; align-items:center; font-weight:600; font-size:14px; color:var(--gold); padding:0 10px;">Слайд 1 из 6</span>
                <button class="btn" onclick="nextSlide()">Вперед ▶</button>
            </div>
        </div>

        <!-- SLIDE 1 -->
        <div class="slide active">
            <span class="card-badge">ЭКСКЛЮЗИВНАЯ КОЛЛЕКЦИЯ 2027 🇬🇪</span>
            <h1>Грузия 2027: Авторские Туры</h1>
            <p class="subtitle">Основная концепция: <b>{selected_concept}</b><br/>От старинных виноделен Алазанской долины до панорам Казбеги и башен высокогорной Сванетии.</p>
            <div style="background: rgba(153,27,27,0.15); border: 1px solid var(--wine); padding: 20px; border-radius: 12px; max-width: 600px;">
                <p style="font-size: 14px; color: #fca5a5;">✨ Презентация полностью сгенерирована AI-ассистентом Mika (AGY Brain) с глубоким погружением в культуру, географию и логистику Грузии.</p>
            </div>
            <div class="slide-footer">
                <span>Используйте стрелки ◀ ▶ на клавиатуре или кнопки вверху</span>
                <span>Mika Desktop 2026</span>
            </div>
        </div>

        <!-- SLIDE 2 -->
        <div class="slide">
            <span class="card-badge">ПОЧЕМУ 2027 ГОД?</span>
            <h2>Концепция и Тренды Сезона 2027</h2>
            <div class="grid-3">
                <div class="card">
                    <span class="card-badge">Виноделие</span>
                    <h3>🍷 Винный Ренессанс</h3>
                    <ul>
                        <li>8000 лет винной культуры в глиняных квеври.</li>
                        <li>Доступ в закрытые семейные погреба Кахетии.</li>
                        <li>Дегустации раритетных сортов Саперави.</li>
                        <li>Участие в осеннем празднике сбора Ртвели.</li>
                    </ul>
                </div>
                <div class="card">
                    <span class="card-badge">Кавказ</span>
                    <h3>🏔 Горные Экспедиции</h3>
                    <ul>
                        <li>Панорама Казбека (5033 м) и Троицкая церковь.</li>
                        <li>Древние башни Местии и высокогорного Ушгули.</li>
                        <li>Легкие видовые треккинги для всех возрастов.</li>
                        <li>Проживание в дизайнерских лоджах Rooms Hotel.</li>
                    </ul>
                </div>
                <div class="card">
                    <span class="card-badge">Комфорт</span>
                    <h3>🏰 Премиальный Сервис</h3>
                    <ul>
                        <li>Транспорт Mercedes Sprinter VIP Business.</li>
                        <li>Бутик-отели 4-5★ в Тбилиси и Кахетии.</li>
                        <li>Личный шеф-повар и эксперты-историки.</li>
                        <li>Круглосуточный консьерж 24/7.</li>
                    </ul>
                </div>
            </div>
            <div class="slide-footer">
                <span>Слайд 2: Стратегия и позиционирование</span>
                <span>Mika (AGY)</span>
            </div>
        </div>

        <!-- SLIDE 3 -->
        <div class="slide">
            <span class="card-badge">ИТИНЕРАРИИ</span>
            <h2>Флагманские Маршруты 2027</h2>
            <div class="grid-2">
                <div class="card">
                    <span class="card-badge">5 Дней · Гастрономия</span>
                    <h3>Маршрут А: «Душа Кахетии & Тбилиси»</h3>
                    <ul>
                        <li><b>День 1:</b> Прибытие в Тбилиси, фуникулер, серные бани Абанотубани.</li>
                        <li><b>День 2:</b> Прогулка по старым кварталам, арт-галереям и ужин в винном баре.</li>
                        <li><b>День 3:</b> Выезд в Кахетию, город любви Сигнахи, частное шато.</li>
                        <li><b>День 4:</b> Алазанская долина, замок Греми, ужин в усадьбе Цинандали.</li>
                        <li><b>День 5:</b> Мастер-класс по грузинской выпечке и отъезд.</li>
                    </ul>
                </div>
                <div class="card">
                    <span class="card-badge">7 Дней · Экспедиция</span>
                    <h3>Маршрут B: «Казбеги & Высокая Сванетия»</h3>
                    <ul>
                        <li><b>День 1-2:</b> Военно-Грузинская дорога, Ананури, арка Дружбы, закат над Казбеком.</li>
                        <li><b>День 3:</b> Джип-тур в живописное ущелье Трусо и минеральные источники.</li>
                        <li><b>День 4-5:</b> Перелет/трансфер в Сванетию, башни Местии, музей Хергиани.</li>
                        <li><b>День 6:</b> Выезд в самое высокогорное село Европы — Ушгули (2200 м).</li>
                        <li><b>День 7:</b> Спуск к Черному морю в Батуми или возвращение в Тбилиси.</li>
                    </ul>
                </div>
            </div>
            <div class="slide-footer">
                <span>Слайд 3: Детализированные программы</span>
                <span>Mika (AGY)</span>
            </div>
        </div>

        <!-- SLIDE 4 -->
        <div class="slide">
            <span class="card-badge">ПОГОДА & СЕЗОННОСТЬ</span>
            <h2>Календарь Путешествий 2027</h2>
            <div class="grid-4">
                <div class="card">
                    <span class="card-badge">Апрель - Май</span>
                    <h3>🌸 Весна 2027</h3>
                    <ul>
                        <li>Цветение садов и зелень.</li>
                        <li>Идеально для Тбилиси (+22°C).</li>
                        <li>Пасхальные традиции.</li>
                        <li>Молодые вина урожая.</li>
                    </ul>
                </div>
                <div class="card">
                    <span class="card-badge">Июнь - Август</span>
                    <h3>☀️ Лето 2027</h3>
                    <ul>
                        <li>Прохлада в горах Кавказа.</li>
                        <li>Открыты перевалы в Сванетию.</li>
                        <li>Купальный сезон в Батуми.</li>
                        <li>Музыкальные фестивали.</li>
                    </ul>
                </div>
                <div class="card">
                    <span class="card-badge">Сентябрь - Октябрь</span>
                    <h3>🍇 Осень 2027</h3>
                    <ul>
                        <li>Сезон сбора винограда Ртвели!</li>
                        <li>Золотая осень в ущельях.</li>
                        <li>Фестиваль Тбилисоба.</li>
                        <li>Бархатный сезон.</li>
                    </ul>
                </div>
                <div class="card">
                    <span class="card-badge">Декабрь - Февраль</span>
                    <h3>❄️ Зима 2027</h3>
                    <ul>
                        <li>Курорт Гудаури и фрирайд.</li>
                        <li>Праздничный Тбилиси.</li>
                        <li>Горячие серные бани.</li>
                        <li>Зимнее застолье с хачапури.</li>
                    </ul>
                </div>
            </div>
            <div class="slide-footer">
                <span>Слайд 4: Круглогодичные туры</span>
                <span>Mika (AGY)</span>
            </div>
        </div>

        <!-- SLIDE 5 -->
        <div class="slide">
            <span class="card-badge">СТОИМОСТЬ</span>
            <h2>Пакеты и Тарифы 2027</h2>
            <div class="grid-3">
                <div class="card">
                    <span class="card-badge">Базовый Комфорт</span>
                    <h3>Comfort Explorer</h3>
                    <p style="font-size:20px; font-weight:800; color:var(--gold); margin:8px 0;">$1,250 <span style="font-size:13px; font-weight:normal; color:var(--text-muted);">/ чел</span></p>
                    <ul>
                        <li>Отели 4★ с завтраками.</li>
                        <li>Комфортный микроавтобус.</li>
                        <li>Все входные билеты и гид.</li>
                        <li>3 главные дегустации вин.</li>
                    </ul>
                </div>
                <div class="card" style="border-color:var(--gold);">
                    <span class="card-badge">ХИТ ПРОДАЖ</span>
                    <h3>VIP Boutique & Wine</h3>
                    <p style="font-size:20px; font-weight:800; color:var(--gold); margin:8px 0;">$2,400 <span style="font-size:13px; font-weight:normal; color:var(--text-muted);">/ чел</span></p>
                    <ul>
                        <li>Отели 5★ (Rooms Hotel, Radisson).</li>
                        <li>Mercedes V-Class VIP трансфер.</li>
                        <li>Все обеды и ужины в топ-ресторанах.</li>
                        <li>Приватные закрытые дегустации.</li>
                        <li>Консьерж-сервис 24/7.</li>
                    </ul>
                </div>
                <div class="card">
                    <span class="card-badge">Эксклюзив</span>
                    <h3>Bespoke Luxury</h3>
                    <p style="font-size:20px; font-weight:800; color:var(--gold); margin:8px 0;">От $4,500 <span style="font-size:13px; font-weight:normal; color:var(--text-muted);">/ чел</span></p>
                    <ul>
                        <li>Индивидуальный сценарий тура.</li>
                        <li>Вертолетные экскурсии на Казбек.</li>
                        <li>Коллекционные вина вековой выдержки.</li>
                        <li>Личный шеф-повар и охрана.</li>
                    </ul>
                </div>
            </div>
            <div class="slide-footer">
                <span>Слайд 5: Прозрачная тарифная сетка</span>
                <span>Mika (AGY)</span>
            </div>
        </div>

        <!-- SLIDE 6 -->
        <div class="slide">
            <span class="card-badge">СВЯЗЬ С НАМИ</span>
            <h2>Раннее Бронирование Сезона 2027</h2>
            <div class="card" style="margin-top:20px; padding:30px;">
                <p style="font-size:16px; color:var(--text-main); margin-bottom:16px;">
                    Раннее бронирование тура в Грузию 2027 гарантирует сохранение цен и бронь лучших номеров в видовых отелях Казбеги и Кахетии.
                </p>
                <ul style="margin-bottom:24px;">
                    <li><b>Скидка ранней пташки:</b> 15% при бронировании до 31 декабря 2026 года.</li>
                    <li><b>Телефон / WhatsApp:</b> +995 (555) 00-2027</li>
                    <li><b>Электронная почта:</b> tours2027@georgia-travel.com</li>
                    <li><b>Индивидуальная адаптация:</b> под любые даты и состав гостей.</li>
                </ul>
                <div style="background:rgba(245, 158, 11, 0.1); border:1px solid rgba(245, 158, 11, 0.3); padding:16px; border-radius:10px; font-size:14px; color:var(--gold);">
                    🐱 Создано для Катеньки персональным ассистентом Mika (AGY Brain)!
                </div>
            </div>
            <div class="slide-footer">
                <span>Слайд 6: Финал презентации</span>
                <span>Mika Desktop 2026</span>
            </div>
        </div>
    </div>

    <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.slide');
        const indicator = document.getElementById('slideIndicator');

        function showSlide(index) {{
            slides[currentSlide].classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
            indicator.textContent = `Слайд ${{currentSlide + 1}} из ${{slides.length}}`;
        }}

        function nextSlide() {{ showSlide(currentSlide + 1); }}
        function prevSlide() {{ showSlide(currentSlide - 1); }}

        document.addEventListener('keydown', (e) => {{
            if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
            if (e.key === 'ArrowLeft') prevSlide();
        }});
    </script>
</body>
</html>
"""
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)
    return output_path


if __name__ == "__main__":
    pptx_path = "/tmp/georgia_tours_2027.pptx"
    html_path = "/tmp/georgia_tours_2027.html"
    create_pptx_deck(pptx_path)
    create_html_deck(html_path)
    print(f"Generated PPTX: {pptx_path}")
    print(f"Generated HTML: {html_path}")
