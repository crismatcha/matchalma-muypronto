/* Matchalma · «Muy pronto». Un solo cometido: apuntar el correo a la lista «Interesados en la apertura» de Klaviyo.
   Sin cookies, sin localStorage, sin analítica. La única llamada de red va a a.klaviyo.com. */
(function () {
  'use strict';

  var COMPANY = 'SpgjHN';
  var LISTA = 'TqnRrU';
  var CARGADA = Date.now();

  var form = document.getElementById('mp-form');
  if (!form) return;
  var input = document.getElementById('mp-correo');
  var casilla = document.getElementById('mp-acepto');
  var trampa = document.getElementById('mp-web');
  var boton = form.querySelector('.mp-boton');
  var err = document.getElementById('mp-error');
  var gracias = document.getElementById('mp-gracias');
  var quien = document.getElementById('mp-gracias-correo');

  var DOMINIOS = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.es': 'gmail.com', 'gmaill.com': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotamil.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmail.co': 'hotmail.com', 'hotmaill.com': 'hotmail.com', 'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.con': 'outlook.com', 'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'iclod.com': 'icloud.com', 'icloud.con': 'icloud.com' };
  function sugerencia(c) {
    var i = c.lastIndexOf('@');
    if (i < 1) return '';
    var d = c.slice(i + 1).toLowerCase();
    return DOMINIOS[d] ? c.slice(0, i + 1) + DOMINIOS[d] : '';
  }

  function aviso(texto) { err.textContent = texto; err.hidden = false; }

  /* Si el envío falla se explica en llano y se ofrece una salida: probar con otra conexión o escribirnos con el correo ya redactado.
     El código técnico («red» = no llegó a Klaviyo; un número = Klaviyo respondió con error) NO se enseña a la persona: va escondido en el atributo data-codigo y dentro del correo de «escríbenos». */
  function avisoFallo(codigo, correo) {
    err.textContent = '';
    err.setAttribute('data-codigo', codigo);
    err.appendChild(document.createTextNode('No hemos podido apuntarte ahora. Prueba con otra conexión (por ejemplo, los datos del móvil en vez del wifi) o desactiva el bloqueador de anuncios o la VPN. Si sigue sin funcionar, '));
    var a = document.createElement('a');
    a.href = 'mailto:hola@matchalma.com?subject=' + encodeURIComponent('Quiero apuntarme a Matchalma') + '&body=' + encodeURIComponent('Hola, quiero que me apuntéis para el aviso de apertura. Mi correo es ' + correo + '\n\n(Dato técnico, por favor no borrar: ' + codigo + ')');
    a.textContent = 'escríbenos y te apuntamos nosotros';
    err.appendChild(a);
    err.appendChild(document.createTextNode('.'));
    err.hidden = false;
  }

  var ultimaSugerencia = '';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;

    var correo = (input.value || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)) {
      aviso('Revisa el correo: parece que falta algo.');
      input.focus();
      return;
    }
    if (!casilla.checked) {
      aviso('Marca la casilla para que podamos avisarte.');
      casilla.focus();
      return;
    }
    var sug = sugerencia(correo);
    if (sug && ultimaSugerencia !== correo) {
      ultimaSugerencia = correo;
      aviso('¿Quisiste decir ' + sug + '? Corrígelo o pulsa de nuevo para usar ' + correo + '.');
      input.focus();
      return;
    }

    /* Trampa para bots: campo oculto relleno, o envío en menos de 2 s. Se les enseña el «gracias» y no se envía nada. */
    if ((trampa && trampa.value) || Date.now() - CARGADA < 2000) {
      mostrarGracias(correo);
      return;
    }

    boton.disabled = true;
    var cuerpo = {
      data: {
        type: 'subscription',
        attributes: {
          custom_source: 'Landing Muy pronto',
          profile: {
            data: {
              type: 'profile',
              attributes: { email: correo, properties: { fuente: 'Landing Muy pronto' } }
            }
          }
        },
        relationships: { list: { data: { type: 'list', id: LISTA } } }
      }
    };

    fetch('https://a.klaviyo.com/client/subscriptions/?company_id=' + COMPANY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/vnd.api+json', 'revision': '2024-10-15' },
      body: JSON.stringify(cuerpo),
      referrerPolicy: 'no-referrer'
    }).then(function (r) {
      if (!(r.status === 202 || r.ok)) throw new Error(String(r.status));
      mostrarGracias(correo);
    }).catch(function (e) {
      boton.disabled = false;
      avisoFallo(/^\d{3}$/.test(e && e.message) ? e.message : 'red', correo);
    });
  });

  function mostrarGracias(correo) {
    quien.textContent = correo;
    form.hidden = true;
    document.getElementById('mp-intro').hidden = true;
    gracias.hidden = false;
    gracias.setAttribute('tabindex', '-1');
    gracias.focus();
  }
})();
