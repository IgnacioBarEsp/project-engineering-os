# Por qué hace falta orquestar el inicio

El clasificador ya decide la ruta y los prompts ya cubren entorno y discovery, pero nadie une las piezas. La
persona tiene que adivinar qué ruta le corresponde, en qué orden pegar cada prompt y cómo llevar la decisión
a un chat nuevo. Este cambio crea la entrada única que faltaba.

# Cómo se construirá

Un prompt router documental, en la raíz y en el blueprint. Ejecuta el clasificador read-only, muestra ruta y
evidencia, pide aprobación humana explícita y solo entonces registra el estado dentro del repositorio. No
añade comandos, schemas ni API pública, y no toca el contrato del clasificador.

# Qué comportamiento entregará

Las tres rutas llegan a discovery en su propio orden: idea y organización para principiante, ecosistema para
experimentado, inventario y preservación para brownfield. Prompt 00 recibe la ruta sin preguntar por stack ni
producto completo. Prompt 01 reutiliza los hechos confirmados en vez de entrevistar desde cero.

# Qué trabajo se realizará

Se añadirán el router, su espejo administrado, la entrada de manifest, los enlaces de documentación y un
contrato de prompts verificable. Las pruebas cubrirán paridad raíz/blueprint, invariantes por ruta, gates,
relevo, recuperación y casos negativos, además de la fixture de bootstrap.

# Resumen integral del change

El Issue #31 convierte tres piezas sueltas en un recorrido con estado y decisiones trazables. La conversación
explica y pide gates; el CLI clasifica y valida; el repositorio conserva la decisión. Nada se registra sin
aprobación, ninguna ruta se sobrescribe en silencio y la arquitectura del producto sigue esperando al
discovery.
