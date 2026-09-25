## ADDED Requirements

### Requirement: Six canonical profiles and owned focuses
Companion SHALL define exactly six canonical profiles in one pure engine module, with closed focus ids, human labels, required stages, engineering capability, setup and method rules, recipes, stacks and vision guidance. Every consumer SHALL resolve those facts through that module rather than through independent profile-id lists.

#### Scenario: A person selects a focus
- **WHEN** a person chooses one of the six profiles and an owned focus
- **THEN** preparation SHALL retain that pair and produce the matching setup, method, recipes and stages
- **AND** a focus belonging to another profile SHALL fail before any project write

#### Scenario: Two focuses share a profile
- **WHEN** two different focuses in the same profile are rendered for the same project inputs
- **THEN** their setup, method and recipe output SHALL differ in meaningful, testable text

### Requirement: Legacy receipts are mapped without rewriting
Companion SHALL recognize supported 0.3.x profile ids on read, resolve them to the canonical profile/focus pair and preserve the original receipt and owned project files byte for byte until an explicitly reviewed write.

#### Scenario: A Unity project from 0.3.x is opened
- **WHEN** a verified historical receipt says `unity`
- **THEN** the project SHALL display Software y apps / Videojuego and retain the Unity-specific safeguards
- **AND** opening it SHALL NOT rewrite its receipt, inventory or user files

### Requirement: Folder recommendation names profile and focus
Companion SHALL recommend a canonical profile and focus from bounded folder metadata without executing source files or overriding the person's selection. It SHALL recognize Unity, Godot, package.json, LaTeX/BibTeX, notebooks and presentations.

#### Scenario: A folder contains a declared game project
- **WHEN** bounded inventory finds Unity `ProjectVersion.txt` or Godot `project.godot`
- **THEN** the recommendation SHALL identify Software y apps / Videojuego and cite the observed signal

#### Scenario: A person chooses a different valid profile
- **WHEN** the recommendation differs from the profile the person selected
- **THEN** Companion SHALL preserve the person's choice and show the recommendation only as guidance
