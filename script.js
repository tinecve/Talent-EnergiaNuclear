
// ═══════════════════════════════════════════════
//  PARTICLE SYSTEM
// ═══════════════════════════════════════════════
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function createParticle() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.4 + 0.1,
        color: Math.random() > 0.7 ? '#00ff88' : '#00e5ff'
    };
}

function initParticles() {
    particles = Array.from({ length: 120 }, createParticle);
}

function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });
    // connections
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 80) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0,229,255,${0.08 * (1 - dist / 80)})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
    requestAnimationFrame(drawParticles);
}

window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
resizeCanvas();
initParticles();
drawParticles();

// ═══════════════════════════════════════════════
//  COUNTER ANIMATION
// ═══════════════════════════════════════════════
function animateCounter(el, target, duration = 1800) {
    let start = 0;
    const step = timestamp => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        el.textContent = Math.floor(progress * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target + (el.dataset.suffix || '');
    };
    requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            const el = e.target;
            animateCounter(el, parseInt(el.dataset.count));
            counterObs.unobserve(el);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ═══════════════════════════════════════════════
//  INTERSECTION OBSERVER (fade-in)
// ═══════════════════════════════════════════════
const fadeObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.fade-in-up').forEach(el => fadeObs.observe(el));

// ═══════════════════════════════════════════════
//  CHART.JS GLOBAL DEFAULTS
// ═══════════════════════════════════════════════
Chart.defaults.color = '#5a8aaa';
Chart.defaults.borderColor = 'rgba(10,58,90,0.5)';
Chart.defaults.font.family = "'Share Tech Mono', monospace";
Chart.defaults.font.size = 11;

const COLORS = {
    cyan: '#00e5ff',
    green: '#00ff88',
    orange: '#ff6600',
    yellow: '#ffcc00',
    red: '#ff2244',
    blue: '#0088ff',
    purple: '#aa44ff',
    pink: '#ff44aa'
};

function makeGradient(chart, color1, color2) {
    const ctx = chart.ctx;
    const g = ctx.createLinearGradient(0, 0, 0, chart.height);
    g.addColorStop(0, color1);
    g.addColorStop(1, color2);
    return g;
}

// ── CHART 1: Production ──
new Chart(document.getElementById('chart-production'), {
    type: 'bar',
    data: {
        labels: ['🇺🇸 USA', '🇨🇳 China', '🇫🇷 Francia', '🇷🇺 Rusia', '🇰🇷 Corea', '🇨🇦 Canadá', '🇺🇦 Ucrania', '🇩🇪 Alemania', '🇯🇵 Japón', '🇬🇧 RU'],
        datasets: [{
            label: 'TWh',
            data: [772, 411, 320, 208, 166, 96, 65, 52, 88, 47],
            backgroundColor: ctx => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
                g.addColorStop(0, 'rgba(0,229,255,0.7)');
                g.addColorStop(1, 'rgba(0,136,255,0.2)');
                return g;
            },
            borderColor: '#00e5ff',
            borderWidth: 1,
            borderRadius: 4,
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false }, tooltip: {
                backgroundColor: '#081828',
                borderColor: '#00e5ff',
                borderWidth: 1,
                titleFont: { family: 'Share Tech Mono' },
            }
        },
        scales: {
            x: { grid: { color: 'rgba(10,58,90,0.3)' } },
            y: { grid: { color: 'rgba(10,58,90,0.3)' }, ticks: { callback: v => v + ' TWh' } }
        }
    }
});

// ── CHART 2: Energy Mix ──
new Chart(document.getElementById('chart-mix'), {
    type: 'doughnut',
    data: {
        labels: ['Carbón', 'Gas Natural', 'Hidro', 'Nuclear', 'Eólica', 'Solar', 'Otros'],
        datasets: [{
            data: [36, 22, 15, 10, 7, 5, 5],
            backgroundColor: [
                'rgba(80,80,80,0.8)',
                'rgba(100,180,255,0.7)',
                'rgba(0,120,255,0.7)',
                'rgba(0,229,255,0.8)',
                'rgba(0,255,136,0.7)',
                'rgba(255,204,0,0.7)',
                'rgba(100,100,100,0.5)'
            ],
            borderColor: '#020b14',
            borderWidth: 3,
            hoverOffset: 8
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { boxWidth: 12, padding: 12, font: { size: 10 } }
            },
            tooltip: {
                backgroundColor: '#081828',
                borderColor: '#00e5ff',
                borderWidth: 1,
                callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}%` }
            }
        }
    }
});

// ── CHART 3: Timeline reactors ──
const yearsData = [1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2024];
const reactorsData = [2, 12, 71, 176, 245, 374, 417, 437, 438, 443, 437, 442, 440, 436];

new Chart(document.getElementById('chart-timeline'), {
    type: 'line',
    data: {
        labels: yearsData,
        datasets: [{
            label: 'Reactores',
            data: reactorsData,
            borderColor: '#00ff88',
            backgroundColor: ctx => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
                g.addColorStop(0, 'rgba(0,255,136,0.3)');
                g.addColorStop(1, 'rgba(0,255,136,0)');
                return g;
            },
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00ff88',
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: 'rgba(10,58,90,0.3)' } },
            y: { grid: { color: 'rgba(10,58,90,0.3)' }, suggestedMin: 0 }
        }
    }
});

// ── CHART 4: CO2 ──
const co2Labels = ['Carbón', 'Gas', 'Biomasa', 'Solar', 'Hidro', 'Eólica', 'Nuclear'];
const co2Data = [820, 490, 230, 41, 24, 11, 12];

new Chart(document.getElementById('chart-co2'), {
    type: 'bar',
    data: {
        labels: co2Labels,
        datasets: [{
            label: 'gCO₂eq/kWh',
            data: co2Data,
            backgroundColor: co2Data.map((v, i) => {
                if (i < 2) return 'rgba(255,34,68,0.7)';
                if (i < 4) return 'rgba(255,204,0,0.7)';
                return 'rgba(0,255,136,0.7)';
            }),
            borderColor: co2Data.map((v, i) => {
                if (i < 2) return '#ff2244';
                if (i < 4) return '#ffcc00';
                return '#00ff88';
            }),
            borderWidth: 1,
            borderRadius: 4
        }]
    },
    options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { color: 'rgba(10,58,90,0.3)' }, ticks: { callback: v => v + ' g' } },
            y: { grid: { display: false } }
        }
    }
});

// ── CHART Deaths ──
new Chart(document.getElementById('chart-deaths'), {
    type: 'bar',
    data: {
        labels: ['Carbón', 'Petróleo', 'Gas Nat.', 'Biomasa', 'Hidro', 'Nuclear', 'Solar', 'Eólica'],
        datasets: [{
            label: 'Muertes/TWh',
            data: [24.6, 18.4, 2.8, 4.6, 1.3, 0.07, 0.02, 0.04],
            backgroundColor: ['rgba(80,80,80,0.7)', 'rgba(120,60,0,0.7)', 'rgba(100,180,255,0.6)', 'rgba(100,160,60,0.6)', 'rgba(0,120,255,0.6)', 'rgba(0,229,255,0.7)', 'rgba(255,204,0,0.6)', 'rgba(0,255,136,0.6)'],
            borderWidth: 1,
            borderRadius: 4,
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(10,58,90,0.3)' }, type: 'logarithmic', ticks: { callback: v => v } }
        }
    }
});

// ── CHART Future ──
new Chart(document.getElementById('chart-future'), {
    type: 'line',
    data: {
        labels: ['2024', '2030', '2035', '2040', '2045', '2050'],
        datasets: [
            {
                label: 'Escenario alto',
                data: [395, 462, 555, 670, 780, 890],
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0,255,136,0.05)',
                fill: true, tension: 0.4, pointRadius: 4
            },
            {
                label: 'Escenario base',
                data: [395, 430, 470, 520, 560, 600],
                borderColor: '#00e5ff',
                backgroundColor: 'rgba(0,229,255,0.05)',
                fill: true, tension: 0.4, pointRadius: 4
            },
            {
                label: 'Escenario bajo',
                data: [395, 400, 395, 380, 360, 340],
                borderColor: '#ff6600',
                backgroundColor: 'rgba(255,102,0,0.04)',
                fill: true, tension: 0.4, pointRadius: 4, borderDash: [5, 4]
            }
        ]
    },
    options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { boxWidth: 10, font: { size: 10 } } } },
        scales: {
            x: { grid: { color: 'rgba(10,58,90,0.3)' } },
            y: { grid: { color: 'rgba(10,58,90,0.3)' }, ticks: { callback: v => v + ' GW' } }
        }
    }
});

// ═══════════════════════════════════════════════
//  WORLD REACTORS DATA
// ═══════════════════════════════════════════════
const worldData = [
    { flag: '🇺🇸', name: 'Estados Unidos', reactors: 93, pct: 100 },
    { flag: '🇫🇷', name: 'Francia', reactors: 56, pct: 60 },
    { flag: '🇨🇳', name: 'China', reactors: 55, pct: 59 },
    { flag: '🇷🇺', name: 'Rusia', reactors: 36, pct: 39 },
    { flag: '🇰🇷', name: 'Corea del Sur', reactors: 25, pct: 27 },
    { flag: '🇮🇳', name: 'India', reactors: 22, pct: 24 },
    { flag: '🇨🇦', name: 'Canadá', reactors: 19, pct: 20 },
    { flag: '🇺🇦', name: 'Ucrania', reactors: 15, pct: 16 },
    { flag: '🇬🇧', name: 'Reino Unido', reactors: 9, pct: 10 },
    { flag: '🇯🇵', name: 'Japón', reactors: 12, pct: 13 },
    { flag: '🇨🇿', name: 'República Checa', reactors: 6, pct: 6 },
    { flag: '🇦🇷', name: 'Argentina', reactors: 3, pct: 3 },
];

const grid = document.querySelector('.world-grid');
worldData.forEach(c => {
    grid.innerHTML += `
    <div class="country-card fade-in-up">
      <span class="country-flag">${c.flag}</span>
      <div class="country-name">${c.name}</div>
      <div class="country-reactors">${c.reactors}<span>REACTORES</span></div>
      <div class="country-bar-bg"><div class="country-bar-fill" style="width:0%" data-w="${c.pct}%"></div></div>
    </div>`;
});

// Animate bars
const barObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.querySelectorAll('.country-bar-fill').forEach(b => {
                setTimeout(() => { b.style.width = b.dataset.w; }, 200);
            });
        }
    });
}, { threshold: 0.2 });

barObs.observe(grid);
grid.querySelectorAll('.fade-in-up').forEach(el => fadeObs.observe(el));

// World bar chart
new Chart(document.getElementById('chart-world-bar'), {
    type: 'bar',
    data: {
        labels: worldData.map(c => c.flag + ' ' + c.name),
        datasets: [{
            data: worldData.map(c => c.reactors),
            backgroundColor: ctx => {
                const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
                g.addColorStop(0, 'rgba(0,229,255,0.7)');
                g.addColorStop(1, 'rgba(0,136,255,0.2)');
                return g;
            },
            borderColor: '#00e5ff',
            borderWidth: 1,
            borderRadius: 4
        }]
    },
    options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { grid: { color: 'rgba(10,58,90,0.3)' }, ticks: { callback: v => v + ' u.' } }
        }
    }
});

// ═══════════════════════════════════════════════
//  TIMELINE DATA
// ═══════════════════════════════════════════════
const timelineData = [
    { year: '1932', type: 'discovery', badge: 'Descubrimiento', title: 'Descubrimiento del Neutrón', text: 'James Chadwick descubre el neutrón, partícula sin carga que resultará fundamental para la fisión nuclear. Sin este hallazgo, la energía nuclear no habría sido posible.' },
    { year: '1938', type: 'discovery', badge: 'Físico-Química', title: 'Primera Fisión Nuclear Artificial', text: 'Otto Hahn, Fritz Strassmann, Lise Meitner y Otto Frisch demuestran que el núcleo del uranio puede dividirse en dos, liberando una cantidad colosal de energía.' },
    { year: '1942', type: 'milestone', badge: 'Hito', title: 'Primera Reacción Nuclear Sostenida', text: 'Enrico Fermi y su equipo logran en Chicago la primera reacción nuclear en cadena autosostenida en el "Chicago Pile-1", marcando el inicio de la era nuclear.' },
    { year: '1945', type: 'warn', badge: 'Conflicto', title: 'Bombas Atómicas de Hiroshima y Nagasaki', text: 'Estados Unidos lanza dos bombas atómicas sobre Japón, las únicas armas nucleares usadas en guerra. Las devastadoras consecuencias impulsarán décadas de debate ético y tratados de no proliferación.' },
    { year: '1954', type: 'milestone', badge: 'Hito', title: 'Primera Central Nuclear Comercial', text: 'La URSS inaugura en Óbninsk la primera central nuclear del mundo conectada a la red eléctrica, con una potencia de 5 MWe. Comienza la era de la energía nuclear civil.' },
    { year: '1957', type: 'milestone', badge: 'Organismo', title: 'Fundación del OIEA', text: 'Se crea el Organismo Internacional de Energía Atómica (OIEA/IAEA) con sede en Viena, encargado de promover el uso pacífico de la energía nuclear y prevenir la proliferación de armas.' },
    { year: '1979', type: 'accident', badge: 'Accidente', title: 'Three Mile Island (EE.UU.)', text: 'Fusión parcial del núcleo del reactor TMI-2 en Pensilvania. No causó muertes directas pero generó desconfianza masiva y paralizó la construcción de nuevas plantas nucleares en EE.UU. durante décadas.' },
    { year: '1986', type: 'accident', badge: 'Accidente', title: 'Catástrofe de Chernóbil', text: 'La peor catástrofe nuclear de la historia. El reactor N°4 de la central Vladímir Lenin explotó en Ucrania (URSS). Causó 31 muertes directas y se estiman miles más por cáncer radioinducido. Una región de 30 km sigue siendo zona de exclusión.' },
    { year: '2011', type: 'accident', badge: 'Accidente', title: 'Fukushima Daiichi (Japón)', text: 'Un tsunami de 15m destruye los sistemas de enfriamiento de tres reactores. La fusión del núcleo libera radiación al mar y al aire. Sin muertes directas por radiación; 1 fallecimiento confirmado por cáncer en 2018.' },
    { year: '2022', type: 'milestone', badge: 'Fusión', title: 'Ignición en el NIF (EE.UU.)', text: 'Por primera vez en la historia, el National Ignition Facility logra una reacción de fusión nuclear que produce más energía de la que consume el láser de ignición (3.15 MJ vs 2.05 MJ). Un hito histórico en el camino hacia la fusión comercial.' },
    { year: '2030s', type: 'milestone', badge: 'Futuro', title: 'Reactores de IV Generación y SMR', text: 'Los reactores de IV generación (sales fundidas, refrigerados por gas, neutrones rápidos) y los Reactores Modulares Pequeños (SMR) prometen ser más seguros, eficientes y económicos. Más de 70 diseños están en desarrollo.' },
];

const tc = document.getElementById('timeline-container');
timelineData.forEach((item, i) => {
    const badgeClass = { discovery: 'badge-discovery', accident: 'badge-accident', milestone: 'badge-milestone', warn: 'badge-warn' }[item.type];
    tc.innerHTML += `
    <div class="timeline-item" style="transition-delay:${i * 0.08}s">
      <div class="timeline-dot"></div>
      <div class="timeline-year">${item.year}</div>
      <span class="timeline-badge ${badgeClass}">${item.badge}</span>
      <div class="timeline-title">${item.title}</div>
      <p class="timeline-text">${item.text}</p>
    </div>`;
});

const tlObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.timeline-item').forEach(el => tlObs.observe(el));

// ═══════════════════════════════════════════════
//  ISOTOPES
// ═══════════════════════════════════════════════
const isotopes = [
    { num: '235', sym: 'U', name: 'Uranio-235', half: '703 Ma', type: 'fission', typeLabel: 'Fisión', symbol: 'U' },
    { num: '238', sym: 'U', name: 'Uranio-238', half: '4.47 Ga', type: 'radio', typeLabel: 'Radiact.', symbol: 'U' },
    { num: '239', sym: 'Pu', name: 'Plutonio-239', half: '24.100 a', type: 'fission', typeLabel: 'Fisión', symbol: 'Pu' },
    { num: '2', sym: 'H', name: 'Deuterio', half: 'Estable', type: 'fusion', typeLabel: 'Fusión', symbol: 'H' },
    { num: '3', sym: 'H', name: 'Tritio', half: '12.3 a', type: 'fusion', typeLabel: 'Fusión', symbol: 'T' },
    { num: '90', sym: 'Sr', name: 'Estroncio-90', half: '28.8 a', type: 'radio', typeLabel: 'Residuo', symbol: 'Sr' },
    { num: '137', sym: 'Cs', name: 'Cesio-137', half: '30.2 a', type: 'radio', typeLabel: 'Residuo', symbol: 'Cs' },
    { num: '14', sym: 'C', name: 'Carbono-14', half: '5.730 a', type: 'radio', typeLabel: 'Radiact.', symbol: 'C' },
    { num: '60', sym: 'Co', name: 'Cobalto-60', half: '5.27 a', type: 'radio', typeLabel: 'Medicina', symbol: 'Co' },
    { num: '4', sym: 'He', name: 'Helio-4', half: 'Estable', type: 'fusion', typeLabel: 'Fusión', symbol: 'He' },
    { num: '232', sym: 'Th', name: 'Torio-232', half: '14.05 Ga', type: 'fission', typeLabel: 'Combustib.', symbol: 'Th' },
    { num: '241', sym: 'Am', name: 'Americio-241', half: '432 a', type: 'radio', typeLabel: 'Residuo', symbol: 'Am' },
];

const ig = document.getElementById('isotope-grid');
isotopes.forEach(iso => {
    const typeClass = { fission: 'type-fission', fusion: 'type-fusion', radio: 'type-radio' }[iso.type];
    ig.innerHTML += `
    <div class="isotope-card fade-in-up" data-symbol="${iso.symbol}">
      <span class="iso-number">${iso.num}</span>
      <span class="iso-symbol">${iso.sym}</span>
      <span class="iso-name">${iso.name}</span>
      <span class="iso-halflife">T½ ${iso.half}</span>
      <span class="iso-type ${typeClass}">${iso.typeLabel}</span>
    </div>`;
});

ig.querySelectorAll('.fade-in-up').forEach(el => fadeObs.observe(el));

// ═══════════════════════════════════════════════
//  REACTOR STEPS INTERACTION
// ═══════════════════════════════════════════════
document.querySelectorAll('.reactor-step').forEach(step => {
    step.addEventListener('click', function () {
        document.querySelectorAll('.reactor-step').forEach(s => s.classList.remove('active'));
        this.classList.add('active');
    });
});

// Neutron animation in SVG
const svgNeutrons = document.getElementById('neutrons');
let neutronAngle = 0;
setInterval(() => {
    neutronAngle += 15;
    const cx = 200 + 60 * Math.cos(neutronAngle * Math.PI / 180);
    const cy = 200 + 60 * Math.sin(neutronAngle * Math.PI / 180);
    const n = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    n.setAttribute('cx', cx);
    n.setAttribute('cy', cy);
    n.setAttribute('r', 3);
    n.setAttribute('fill', '#00ff88');
    n.setAttribute('opacity', '0.8');
    svgNeutrons.appendChild(n);
    setTimeout(() => n.remove(), 1200);
}, 200);

// ═══════════════════════════════════════════════
//  CSV IMPORT
// ═══════════════════════════════════════════════
let csvChart = null;

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('csv-file-input');

dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processCSV(file);
});

fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) processCSV(fileInput.files[0]);
});

function processCSV(file) {
    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: results => {
            const data = results.data;
            const fields = results.meta.fields;
            if (!data.length || !fields.length) return;

            // Update info
            document.getElementById('csv-info').style.display = 'block';
            document.getElementById('csv-rows').textContent = data.length;
            document.getElementById('csv-cols').textContent = fields.length;
            document.getElementById('csv-filename').textContent = file.name;
            document.getElementById('csv-status-text').textContent = 'DATOS CARGADOS';
            document.getElementById('csv-dot').classList.add('active');

            renderCSVChart(data, fields);
            renderCSVTable(data, fields);
        }
    });
}

function renderCSVChart(data, fields) {
    const container = document.getElementById('csv-chart-container');
    container.innerHTML = '<canvas id="csv-chart-canvas"></canvas>';
    container.style.height = '350px';

    const labelField = fields[0];
    const numFields = fields.slice(1).filter(f => typeof data[0][f] === 'number');

    if (!numFields.length) {
        container.innerHTML = '<div class="csv-placeholder"><span class="ph-icon">⚠️</span><div>NO SE ENCONTRARON<br>COLUMNAS NUMÉRICAS</div></div>';
        return;
    }

    const colors = [COLORS.cyan, COLORS.green, COLORS.orange, COLORS.yellow, COLORS.purple];

    if (csvChart) csvChart.destroy();
    csvChart = new Chart(document.getElementById('csv-chart-canvas'), {
        type: numFields.length > 1 ? 'bar' : 'line',
        data: {
            labels: data.map(r => r[labelField]),
            datasets: numFields.map((f, i) => ({
                label: f,
                data: data.map(r => r[f]),
                borderColor: colors[i % colors.length],
                backgroundColor: ctx => {
                    const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                    g.addColorStop(0, colors[i % colors.length] + 'aa');
                    g.addColorStop(1, colors[i % colors.length] + '11');
                    return g;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                borderRadius: 4,
            }))
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { labels: { boxWidth: 10 } },
                tooltip: { backgroundColor: '#081828', borderColor: '#00e5ff', borderWidth: 1 }
            },
            scales: {
                x: { grid: { color: 'rgba(10,58,90,0.3)' } },
                y: { grid: { color: 'rgba(10,58,90,0.3)' } }
            }
        }
    });
}

function renderCSVTable(data, fields) {
    const tc = document.getElementById('csv-table-container');
    tc.style.display = 'block';
    const maxRows = Math.min(data.length, 8);
    let html = '<div class="table-wrapper"><table><thead><tr>';
    fields.forEach(f => html += `<th>${f}</th>`);
    html += '</tr></thead><tbody>';
    for (let i = 0; i < maxRows; i++) {
        html += '<tr>';
        fields.forEach(f => html += `<td>${data[i][f] ?? '—'}</td>`);
        html += '</tr>';
    }
    if (data.length > maxRows) html += `<tr><td colspan="${fields.length}" style="color:var(--text-dim); text-align:center; font-size:0.7rem;">... ${data.length - maxRows} filas más</td></tr>`;
    html += '</tbody></table></div>';
    tc.innerHTML = html;
}

function loadDemoCSV() {
    const demoData = `año,produccion_TWh,reactores_operativos,share_global
2014,2411,391,10.6
2015,2441,400,10.6
2016,2476,402,10.5
2017,2503,408,10.4
2018,2563,416,10.2
2019,2657,443,10.4
2020,2553,441,10.1
2021,2653,436,10.4
2022,2545,422,9.8
2023,2602,436,9.9`;

    const results = Papa.parse(demoData, { header: true, dynamicTyping: true, skipEmptyLines: true });
    const { data, meta: { fields } } = results;

    document.getElementById('csv-info').style.display = 'block';
    document.getElementById('csv-rows').textContent = data.length;
    document.getElementById('csv-cols').textContent = fields.length;
    document.getElementById('csv-filename').textContent = 'demo_nuclear.csv';
    document.getElementById('csv-status-text').textContent = 'DEMO CARGADO';
    document.getElementById('csv-dot').classList.add('active');

    renderCSVChart(data, fields);
    renderCSVTable(data, fields);
}

function exportChartPNG() {
    const canvas = document.getElementById('csv-chart-canvas');
    if (!canvas) { alert('Primero carga o genera un gráfico.'); return; }
    const link = document.createElement('a');
    link.download = 'grafico-nuclear.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Auto-load demo on first load
setTimeout(loadDemoCSV, 800);

