# El defecto, reproducido en esta sesión antes de corregirlo

Ejecutado el 19 de septiembre de 2026 por el agente del apply sobre `a3b1efd`, con el renderer y el servicio
sin cambios. El harness es `verify-ui.mjs` con el recorrido nuevo, antes de tocar la aplicación. Nada de
esto viene del dossier: son mediciones nuevas, y coinciden con las suyas donde se solapan.

## Resultado del recorrido

[wizard-reach.json](wizard-reach.json): 12 recorridos, que son 3 ventanas por 2 preferencias de movimiento
por 2 formas de instalar. Se visitaron 72 de 84 pantallas y 570 de 612 controles fueron alcanzables. Hay
162 problemas y ninguna copia observada.

| Movimiento | Dónde se detiene | Causa medida |
| --- | --- | --- |
| Normal (`no-preference`) | Instalación, en los 6 recorridos | `elementFromPoint` sobre los dos botones de instalar devuelve `div.actions`. Un clic normal de Playwright falla con `<div class="actions">…</div> intercepts pointer events`. |
| Reducido (`reduce`) | Instalación, en los 6 recorridos | La ventana muestra «Describe tu objetivo en hasta 500 caracteres. Revisa la carpeta y vuelve a comprobar. GOAL_INVALID». |

Con movimiento normal, la barra también tapa, en las tres ventanas, el campo «¿Cuánta guía prefieres?»,
la cuarta tarjeta de Delimitación y las tres sugerencias de Visión. En Instalación y en Proyecto listo la
pastilla «Preparar proyecto» declara `aria-pressed="false"`.

Capturas del final de cada pantalla con movimiento normal:
[1180×820, paso 1](wizard-1180x820-setup-final.png), [1180×820, instalación](wizard-1180x820-install-final.png),
[1160×810, paso 1](wizard-1160x810-setup-final.png), [1160×810, instalación](wizard-1160x810-install-final.png),
[1040×700, paso 1](wizard-1040x700-setup-final.png) y [1040×700, instalación](wizard-1040x700-install-final.png).
Las rutas de carpeta están enmascaradas.

## Dos correcciones al diagnóstico del issue

**El `padding-bottom:145px` nunca se aplicó.** `main#content` tiene especificidad (1,0,1) y gana a
`main:has(.steps)`, que tiene (0,1,1). El padding medido es 60 px en todas las pantallas. El «scroll
muerto» es otra cosa: la barra se ancla al fondo del contenido, y lo que tapa se mueve con ella. Desplazar
la página solo descubre la franja vacía de debajo, unos 120 px con el aviso vacío y el padding normal,
nunca el contenido oculto.

**Hay un quinto defecto en el mismo recorrido.** Una visión de más de una línea hace fallar la instalación:
[vision-line-break.json](vision-line-break.json). Con una sola línea se llega al final; con una sugerencia
o con un salto de línea escrito a mano, `GOAL_INVALID`. Hoy lo oculta la barra, que tapa las sugerencias.
Se añadió a la spec antes de corregirlo ([decisión 6](../../design.md)).

## Del lado del puente IPC

[preload-guard-031.json](preload-guard-031.json) aplica a `a3b1efd` la comprobación nueva de
`qa/desktop.mjs`, que exige que el preload exponga toda operación que el renderer nombra. Sobre 0.3.1
falla con `copyText`.

## Visto y fuera de alcance

A 1040 px la navegación de la cabecera parte palabras («Inici/o», «Ayud/a») y la marca «Companion» se monta
sobre ella; se ve en la captura de instalación a ese ancho. No impide terminar el asistente ni lo toca este
change. Pertenece al layout de la cabecera, que es #144, y se comenta allí por
[decisión del mantenedor](../maintainer-decisions.md).
