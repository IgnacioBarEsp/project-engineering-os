# Revisión adversarial — congress-presentation-concept-layout

## Preguntas de ataque

1. ¿La corrección oculta el problema solo en el PDF, dejando la fuente del PPTX sin arreglar? **No:** el
   generador versionado mueve el textbox a `x = 6.6`; el nuevo PPTX se produce desde esa fuente.
2. ¿La nueva comprobación pasa al inspeccionar solo texto y vuelve a ignorar el fondo? **No:** localiza
   específicamente la forma sin texto de 5.6 × 3.9 in y la explicación de 5.6 × 2.0 in en cada diapositiva
   6–12, y exige al menos 0.15 in de separación.
3. ¿La prueba detecta el defecto real? **Sí:** en el PPTX original falla únicamente en las páginas 7, 9 y 11,
   con `-0.10 in`; en el regenerado pasa las 22.
4. ¿La corrección puede alterar cifras, claims o notas? **No:** solo cambia la coordenada horizontal del texto;
   la comprobación de cifras valida las 90 apariciones de diapositivas y notas frente al guion.
5. ¿El PDF depende de Canva o deja páginas ausentes? **No:** PDF local de 22 páginas, reabierto con Poppler y
   renderizado antes de publicar un enlace descargable desde el issue.
6. ¿La revisión de geometría garantiza fidelidad entre fuentes? **No:** por eso se comprobó visualmente cada
   página renderizada y no se afirma apertura en PowerPoint/Canva.

## Resultado

0 blockers y 0 majors técnicos. La revisión fue realizada por el agente que implementa el cambio; no se
presenta como revisión humana o independiente. La protección de main y la decisión del mantenedor en el PR
siguen siendo obligatorias.
