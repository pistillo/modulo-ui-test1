# Sistema di Temi Centralizzato

Questo sistema centralizza tutti i temi CSS seguendo lo standard Ark UI, organizzato seguendo la struttura della vecchia libreria theme.

## Struttura

```
theme/
├── index.css                    # File principale che importa tutto
├── variables.css               # Variabili CSS per tutti i temi (modern, agid, dark, police)
├── base.css                    # Stili base globali
├── effects.css                 # Effetti di background per ogni tema
├── foundations/                # Design tokens base
│   ├── colors.css             # Palette colori (brand, gray, blue, green, red, etc.)
│   ├── typography.css         # Font families, sizes, line heights, weights
│   ├── spacing.css            # Border radius, shadows, spacing scale
│   └── layout.css             # Breakpoints, z-index, grid templates
├── semantic-tokens/            # Token semantici role-based
│   └── semantic-tokens.css     # background.*, text.*, border.*, input.*, button.*, state.*
├── presets/                    # Preset temi
│   ├── index.css              # Import centrale di tutti i preset
│   ├── modern.css             # Preset Modern (default, iOS-inspired)
│   ├── agid.css               # Preset AGID (Italian design guidelines)
│   ├── dark.css               # Preset Dark (dark theme)
│   ├── police.css             # Preset Police (blue-800 theme)
│   └── xmas.css               # Preset Xmas (Christmas theme with snow effects)
└── components/                 # Stili CSS per ogni componente
    ├── button.css
    ├── input.css
    ├── checkbox.css
    ├── select.css
    ├── radio-group.css
    ├── switch.css
    ├── toggle.css
    ├── accordion.css
    ├── tabs.css
    ├── dialog.css
    ├── popover.css
    ├── tooltip.css
    ├── menu.css
    ├── autocomplete.css
    ├── avatar.css
    ├── progress.css
    ├── number-input.css
    ├── password-input.css
    ├── date-picker.css
    ├── time-input.css
    ├── textarea.css
    └── search.css
```

## Organizzazione

### Foundations (`foundations/`)

Contiene i design tokens base che sono la base per tutti i temi:

- **colors.css**: Definisce tutte le palette colori (brand, gray, blue, green, red, orange, navy, etc.)
- **typography.css**: Definisce font families, font sizes, line heights, font weights
- **spacing.css**: Definisce border radius, shadows, spacing scale
- **layout.css**: Definisce breakpoints, z-index scale, grid templates

### Semantic Tokens (`semantic-tokens/`)

Contiene i token semantici role-based che mappano le palette ai ruoli:

- **background.***: `background.default`, `background.surface`, `background.primary`, etc.
- **text.***: `text.default`, `text.secondary`, `text.muted`, `text.primary`, etc.
- **border.***: `border.default`, `border.light`, `border.primary`, `border.focus`, etc.
- **input.***: `input.bg`, `input.border`, `input.placeholder`, `input.focusRing`
- **button.***: `button.primary.bg`, `button.primary.text`, `button.light.bg`, etc.
- **state.***: `state.success`, `state.error`, `state.warning`, `state.info`

### Variables (`variables.css`)

Contiene le variabili CSS specifiche per ogni tema che sovrascrivono i valori di default:

- `--colors-bg`, `--colors-fg`, `--colors-primary`, etc.
- Ogni tema (`modern`, `agid`, `dark`, `police`) ha le sue variabili specifiche

### Presets (`presets/`)

Contiene i preset temi che sovrascrivono le variabili base e le palette colori:

- **modern.css**: Preset Modern (default) con colori iOS Blue
- **agid.css**: Preset AGID con colori istituzionali italiani, font Titillium Web, e scala tipografica AGID
- **dark.css**: Preset Dark con palette indigo per tema scuro
- **police.css**: Preset Police con colori blue-800
- **xmas.css**: Preset Xmas con colori rossi natalizi e effetti neve animati

I preset possono sovrascrivere:
- Palette colori brand
- Colori primari e accent
- Colori button
- Typography (font families, sizes, line heights)
- Spacing (border radius, shadows)
- Effetti speciali (come la neve per xmas)

### Components (`components/`)

Ogni componente ha il suo file CSS che usa esclusivamente variabili CSS semantiche. I componenti della libreria `@tecnosys/components` non importano più CSS locali, ma si basano sui CSS centralizzati in questa cartella.

## Utilizzo

Il file `index.css` dell'app importa automaticamente tutti i temi nell'ordine corretto:

```css
@import './theme/index.css';
```

## Variabili CSS

Tutte le variabili CSS sono definite in `variables.css` e sono disponibili per tutti i temi:

- `--colors-bg` - Background principale
- `--colors-fg` - Testo principale
- `--colors-primary` - Colore primario
- `--colors-button-primary` - Background pulsante primario
- E molte altre...

### Palette Colors (Foundations)

Le palette colori sono definite in `foundations/colors.css`:

- `--palette-brand-*` - Brand colors (50-900)
- `--palette-gray-*` - Gray colors (50-900)
- `--palette-blue-*` - Blue colors (50-900)
- `--palette-green-*` - Green colors (50-900)
- `--palette-red-*` - Red colors (50-900)
- E altre palette...

### Semantic Tokens

I token semantici sono definiti in `semantic-tokens/semantic-tokens.css`:

- `--semantic-background-*` - Background roles
- `--semantic-text-*` - Text roles
- `--semantic-border-*` - Border roles
- `--semantic-input-*` - Input roles
- `--semantic-button-*` - Button roles
- `--semantic-state-*` - State roles

## Aggiungere un Nuovo Componente

1. Crea il file CSS in `theme/components/[nome-componente].css`
2. Usa solo variabili CSS semantiche (`var(--colors-*)` o `var(--semantic-*)`)
3. Usa `data-scope` e `data-part` per targetizzare i componenti Ark UI
4. Aggiungi l'import in `theme/index.css`

## Aggiungere un Nuovo Tema

1. Aggiungi le variabili CSS specifiche del tema in `variables.css` usando `[data-theme="nome-tema"]`
2. Aggiungi i token semantici specifici del tema in `semantic-tokens/semantic-tokens.css`
3. Crea un file preset in `presets/nome-tema.css` per sovrascrivere palette colori, typography, spacing, etc.
4. Aggiungi l'import del nuovo preset in `presets/index.css`
5. (Opzionale) Aggiungi effetti speciali in `effects.css` se il tema li richiede

### Esempio di Preset

```css
/**
 * Preset NomeTema
 */
[data-theme="nome-tema"] {
  /* Brand Palette Override */
  --palette-brand-500: #your-color;
  
  /* Primary Colors */
  --colors-primary: #your-primary;
  --colors-primary-hover: #your-primary-hover;
  
  /* Button Colors */
  --colors-button-primary: #your-button-color;
  
  /* Typography */
  --font-family-base: 'Your Font', sans-serif;
  
  /* Spacing */
  --radius-md: 12px;
}
```

## Best Practices

- ✅ Usa sempre variabili CSS semantiche (`var(--colors-*)` o `var(--semantic-*)`)
- ✅ Non usare colori hardcoded
- ✅ Usa `data-scope` e `data-part` per stilizzare componenti Ark UI
- ✅ Testa tutti i temi quando aggiungi nuovi stili
- ✅ Riferisciti alle palette in `foundations/colors.css` per i colori base
- ✅ Usa i token semantici in `semantic-tokens/` per i ruoli

## Ordine di Import

L'ordine di import è importante:

1. **Foundations** - Design tokens base (colors, typography, spacing, layout)
2. **Semantic Tokens** - Token semantici role-based
3. **Variables** - Variabili CSS specifiche per tema
4. **Presets** - Preset temi che sovrascrivono variabili e palette
5. **Base Styles** - Stili base globali
6. **Component Styles** - Stili per componenti
7. **Effects** - Effetti di background per tema

Questo ordine garantisce che:
- Le variabili base siano disponibili prima dei preset
- I preset possano sovrascrivere le variabili base
- Le variabili finali siano disponibili quando vengono usate nei componenti
