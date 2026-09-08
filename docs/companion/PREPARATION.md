# Motor de preparación local

Entrega #77 del programa #66. El motor se mantiene en `apps/companion/engine`, separado del paquete npm
universal. Usa únicamente módulos de Node y no introduce un framework de producto en las carpetas.
Su API se conecta a la aplicación en #79; estos módulos todavía no son una interfaz o instalador.

## Qué comprueba

`inspectFolder` y `engine.plan` leen una carpeta existente sin crear archivos. La inspección limita
entradas, profundidad, bytes por archivo y bytes totales; no sigue vínculos ni lee rutas sensibles o
generadas conocidas. La respuesta conserva los límites y exclusiones; un PDF se inventaría por metadatos,
sin afirmar que su texto se haya extraído. La recomendación puede corregirse al elegir el perfil.

El proceso principal de la futura app guarda el plan con un identificador opaco. `engine.apply(id)`
verifica de nuevo la carpeta y sus hashes, toma un bloqueo exclusivo y registra la operación antes de
escribir. La vista previa que recibe la interfaz no permite cambiar destinos o contenidos del plan.
Una segunda preparación idéntica no duplica archivos. Un cambio del inventario requiere otra revisión.

Los únicos archivos de producto administrados por esta etapa son `project.json`, `START.md` e
`inventory.json`, dentro de `.project-os/companion`. Su recibo y journal pertenecen al mismo namespace;
la recuperación valida una lista fija de rutas, tipos y hashes. No se modifica un archivo original para
instalar la preparación base. El recibo es evidencia operativa local, no una firma de autoría criptográfica.

## Recuperación

Una cancelación anterior al primer cambio no crea preparación. Una interrupción conserva su journal.
`engine.resume(folder)` continúa después de comprobar todos los archivos de la operación; `rollback`
restaura los bytes anteriores o retira únicamente los archivos nuevos que aún coinciden con su hash.
Las ediciones posteriores detienen la operación y se conservan. No se utiliza reset de Git ni se recorre
la carpeta para borrar archivos por patrones. El historial de la aplicación y la desinstalación se resuelven
en la etapa de distribución; desinstalar la app no debe invocar este rollback sobre proyectos.

Dos instancias se coordinan con un bloqueo exclusivo. Recuperar un bloqueo abandonado es una acción
explícita que verifica que el proceso ya no está activo. Un bloqueo ilegible o un proceso aún vivo no se
retira automáticamente. Los archivos de preparación no se ejecutan y no pueden indicar destinos arbitrarios.
Un proceso hostil con permiso para alterar el sistema de archivos durante una operación queda fuera del
aislamiento de esta app local; no se promete una transacción global contra cualquier proceso del equipo.

## Ingeniería y estados

`createConstructorAdapter` recibe el módulo fijado del constructor desde el proceso de confianza de la
app. Ofrece plan, aplicación, check y rollback usando sus APIs existentes, con bloqueo compartido y
comprobación de que el plan sigue vigente. No recibe comandos arbitrarios desde una interfaz.

El constructor conserva sus condiciones: raíz Git correcta, ownership y conflictos de archivos
preexistentes. Si falta Git o existe una colisión, la respuesta exige una acción; no adopta automáticamente
un package.json ni cambia una política existente. La preparación base documental sigue disponible sin
Git. El recorrido visual deberá resolver o explicar estos requisitos antes de declarar ingeniería lista.

Los estados son independientes: base preparada, inventario actual/obsoleto, contexto pendiente,
archivos de ingeniería comprobados y workflows/herramientas externas no verificados. #78 incorpora
contexto y recetas; #79–#81 conectan instalación, requisitos, UI y pruebas de los recorridos completos.
Este estado intermedio no se presenta como la promesa final del programa.

Vuelve a [experiencia](EXPERIENCE.md) o consulta [evaluación](EVALUATION.md).
La [decisión de seguridad](SECURITY.md) define privilegios, fronteras y límites de recuperación.
