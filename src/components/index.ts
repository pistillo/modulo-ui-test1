import i18n from '@tecnosys/stillum-forms-core/i18n';
import translations from '../i18n';

// Side-effect imports: ogni file chiama registry.register() al top-level
// ─── Pools: Containers ────────────
import './pools/containers/CardPool';

// ─── Pools: Forms ─────────────────
import './pools/forms/FormPool';

// ─── Pools: Layouts ───────────────
import './pools/layouts/FlexPool';
import './pools/layouts/StackPool';
import './pools/layouts/GridPool';
import './pools/layouts/SimpleGridPool';
import './pools/layouts/GridItemPool';
import './pools/layouts/BoxPool';
import './pools/layouts/CenterPool';
import './pools/layouts/ContainerPool';
import './pools/layouts/WrapPool';
import './pools/layouts/AspectRatioPool';
import './pools/layouts/MainLayoutPool';

// ─── Pools: Navigations ──────────
import './pools/navigations/TabsPool';
import './pools/navigations/AccordionPool';
import './pools/navigations/StepsPool';

// ─── Droplets: Forms & Inputs ─────
import './droplets/forms-inputs/TextInputDroplet';
import './droplets/forms-inputs/TextareaDroplet';
import './droplets/forms-inputs/PasswordDroplet';
import './droplets/forms-inputs/NumberDroplet';
import './droplets/forms-inputs/CheckboxDroplet';
import './droplets/forms-inputs/SwitchDroplet';
import './droplets/forms-inputs/SelectDroplet';
import './droplets/forms-inputs/RadioGroupDroplet';
import './droplets/forms-inputs/AutocompleteDroplet';
import './droplets/forms-inputs/SearchInputDroplet';
import './droplets/forms-inputs/DateInputDroplet';
import './droplets/forms-inputs/DatePickerDroplet';
import './droplets/forms-inputs/TimeInputDroplet';

// ─── Droplets: Data Display ───────
import './droplets/data-display/BadgeDroplet';
import './droplets/data-display/AvatarDroplet';
import './droplets/data-display/ListDroplet';
import './droplets/data-display/PageTitleDroplet';
import './droplets/data-display/TableDroplet';
import './droplets/data-display/TreeDroplet';

// ─── Droplets: Navigation ─────────
import './droplets/navigation/BreadcrumbDroplet';

// ─── Droplets: Utilities ──────────
import './droplets/utilities/IconDroplet';

// ─── Droplets: Advanced ───────────
import './droplets/advanced/AttachmentDroplet';
import './droplets/advanced/FullTextSearchDroplet';

// ─── Droplets: Widgets ────────────
import './droplets/widgets/anagrafica/advanced-filter/AdvancedFiltersDroplet';
import './droplets/widgets/anagrafica/anagrafica-table/AnagraficaTableDroplet';
import './droplets/widgets/anagrafica/dati-generali/DatiGeneraliDroplet';
import './droplets/widgets/anagrafica/dati-generali/sections/AnomaliesBannerDroplet';
import './droplets/widgets/anagrafica/dati-generali/sections/DatiIdentificativiCardDroplet';
import './droplets/widgets/anagrafica/dati-generali/sections/HeaderAnagraficaDroplet';
import './droplets/widgets/anagrafica/dati-generali/sections/ImmobiliContrattiCardDroplet';
import './droplets/widgets/anagrafica/dati-generali/sections/NucleoFamiliareCardDroplet';
import './droplets/widgets/anagrafica/dati-generali/sections/RecapitiCardDroplet';
import './droplets/widgets/anagrafica/dati-generali/sections/SituazioneEconomicaCardDroplet';
import './droplets/widgets/anagrafica/nuova-anagrafica-stepper/DatiGeneraliPFFormDroplet';
import './droplets/widgets/anagrafica/nuova-anagrafica-stepper/DatiGeneraliPGFormDroplet';
import './droplets/widgets/anagrafica/nuova-anagrafica-stepper/DatiGeneraliStepDroplet';
import './droplets/widgets/anagrafica/nuova-anagrafica-stepper/RecapitiStepDroplet';
import './droplets/widgets/anagrafica/nuova-anagrafica-stepper/RiepilogoStepDroplet';
import './droplets/widgets/quick-actions/QuickActionsDroplet';
import './droplets/widgets/dashboard-toolbar/DashboardToolbarDroplet';
import './droplets/widgets/leaderboard-widget/LeaderboardWidgetDroplet';
import './droplets/widgets/stat-card/StatCardDroplet';
import './droplets/widgets/stat-card-list/StatCardListDroplet';
import './droplets/widgets/widget-frame/WidgetFrameDroplet';

// ─── Triggers ─────────────────────
import './triggers/ButtonTrigger';

export function registerRuntimeModule(): void {
  if (i18n) {
    i18n.addResourceBundle('en', 'translation', translations.en, true, true);
    i18n.addResourceBundle('it', 'translation', translations.it, true, true);
  }
}

import './droplets/TestDroplet';