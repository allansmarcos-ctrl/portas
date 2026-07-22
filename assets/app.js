'use strict';
(function () {
  // Chave PUBLICA (anon) do Supabase: feita para ficar no navegador. A protecao
  // esta no banco (RLS + RPC que so o anon executa), nao no segredo desta chave.
  var SB_URL = 'https://nwdacjcbafaizbfjoxzn.supabase.co';
  var SB_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53ZGFjamNiYWZhaXpiZmpveHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDUyNTAsImV4cCI6MjA5NjgyMTI1MH0.Ko6R_GUWWrzF72lnQchVcN3kDK04dA0Enj5bACnB61k';

  var origem = new URLSearchParams(location.search).get('de') || 'direto';

  var ctaEntrar = document.getElementById('cta-entrar');
  if (ctaEntrar) {
    ctaEntrar.addEventListener('click', function () {
      document.getElementById('inscricao').scrollIntoView();
    });
  }

  // Revela secoes ao rolar
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('vis'); });
  }

  var form = document.getElementById('form');
  var btn = document.getElementById('btn');
  var erro = document.getElementById('erro');
  var painel = document.getElementById('painel');
  var sucesso = document.getElementById('sucesso');

  function mostrarSucesso() {
    var url = location.origin + location.pathname; // funciona em qualquer dominio
    var msg = 'Vem comigo nas Portas de Jerusalém, uma caça ao tesouro pela Cidade Velha: ' + url;
    document.getElementById('share').href = 'https://wa.me/?text=' + encodeURIComponent(msg);
    painel.classList.add('enviado');
    sucesso.classList.add('on');
    sucesso.scrollIntoView({ block: 'center' });
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    erro.textContent = '';

    // honeypot: robo preencheu o campo escondido. Finge sucesso e NAO envia nada.
    var hp = document.getElementById('hp');
    if (hp && hp.value.trim() !== '') { mostrarSucesso(); return; }

    var nome = document.getElementById('nome').value.trim();
    var whats = document.getElementById('whats').value.trim();
    var quantos = parseInt(document.getElementById('quantos').value, 10);
    if (!nome) { erro.textContent = 'Diga seu nome para bater às portas.'; return; }
    if (whats.replace(/[^0-9]/g, '').length < 8) { erro.textContent = 'Precisamos de um WhatsApp válido para te avisar do dia.'; return; }
    if (!quantos || quantos < 1) { quantos = 1; }

    btn.disabled = true;
    var textoOrig = btn.textContent;
    btn.textContent = 'Selando...';

    fetch(SB_URL + '/rest/v1/rpc/peula_inscrever', {
      method: 'POST',
      headers: { 'apikey': SB_ANON, 'Authorization': 'Bearer ' + SB_ANON, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_nome: nome, p_whatsapp: whats, p_quantos: quantos, p_origem: origem })
    }).then(function (r) {
      if (!r.ok) { throw new Error('status ' + r.status); }
      return r.json();
    }).then(function () {
      mostrarSucesso();
    }).catch(function () {
      btn.disabled = false;
      btn.textContent = textoOrig;
      erro.textContent = 'As portas travaram por um instante. Confira a conexão e tente de novo.';
    });
  });
})();

// Mapa vivo: as tres rotas das seitas se desenham e convergem no Templo
(function () {
  var wrap = document.querySelector('.mapa-svg-wrap');
  if (!wrap) { return; }
  var svg = wrap.querySelector('.rotas');
  var grupos = [].slice.call(svg.querySelectorAll('.rseita'));
  var tesouro = svg.querySelector('.tesouro');
  var ping = svg.querySelector('.t-ping');
  var reduzir = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var rotas = [];
  grupos.forEach(function (g) {
    [].slice.call(g.querySelectorAll('.rota')).forEach(function (p) {
      var L = p.getTotalLength();
      p.style.strokeDasharray = L;
      p.__L = L;
      rotas.push(p);
    });
  });

  function carimbos(g) { return [].slice.call(g.querySelectorAll('.carimbo')); }

  function esconder() {
    rotas.forEach(function (p) { p.style.transition = 'none'; p.style.strokeDashoffset = p.__L; });
    grupos.forEach(function (g) { carimbos(g).forEach(function (c) { c.style.transition = 'none'; c.style.opacity = 0; }); });
    tesouro.classList.remove('aceso');
    tesouro.style.transition = 'none';
    tesouro.style.opacity = 0;
    if (ping) { ping.classList.remove('pingar'); }
    void svg.getBoundingClientRect();
  }

  function final() {
    rotas.forEach(function (p) { p.style.strokeDashoffset = 0; });
    grupos.forEach(function (g) { carimbos(g).forEach(function (c) { c.style.opacity = 1; }); });
    tesouro.style.opacity = 1;
    tesouro.classList.add('aceso');
  }

  function revelar() {
    esconder();
    if (reduzir) { final(); return; }
    grupos.forEach(function (g) {
      var atraso = (parseInt(g.getAttribute('data-onda'), 10) || 0) * 0.5;
      [].slice.call(g.querySelectorAll('.rota')).forEach(function (p) {
        p.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.45,0,.25,1) ' + atraso + 's';
        p.style.strokeDashoffset = 0;
      });
      carimbos(g).forEach(function (c, k) {
        setTimeout(function () { c.style.transition = 'opacity .45s ease'; c.style.opacity = 1; }, (atraso + 0.5) * 1000 + k * 300);
      });
    });
    var fim = (grupos.length - 1) * 0.5 + 1.7;
    setTimeout(function () {
      tesouro.style.transition = 'opacity .5s ease';
      tesouro.style.opacity = 1;
      tesouro.classList.add('aceso');
      if (ping) { ping.classList.remove('pingar'); void svg.getBoundingClientRect(); ping.classList.add('pingar'); }
    }, fim * 1000);
  }

  if (reduzir) { final(); } else { esconder(); }

  if ('IntersectionObserver' in window && !reduzir) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) { if (e.isIntersecting) { revelar(); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    io.observe(wrap);
  } else {
    final();
  }
  wrap.addEventListener('click', revelar);
})();
