# Ensayo de rollback — fix-marker-homograph-detection

Se creó una worktree temporal desde `ff91d4c`, se ejecutó `git revert --no-edit ff91d4c` y se retiró la worktree
limpia. La rama de trabajo no se modificó durante el ensayo.

| Comprobación | Resultado |
| --- | --- |
| Revert del commit de implementación | PASS, commit temporal `6db4a1e` |
| Estado de la worktree temporal antes de retirarla | limpio |
| Baseline tras revert: frases legítimas aceptadas | 2/34 |
| Baseline tras revert: marcadores rechazados | 16/19 |
| Reaparición observable de la regresión | PASS: 32 frases legítimas rechazadas y 3 marcadores aceptados |
| Datos persistidos o migraciones | ninguno |

El rollback es un revert de código y pruebas; restaura el detector anterior sin tocar proyectos consumidores,
configuración ni registros históricos.
