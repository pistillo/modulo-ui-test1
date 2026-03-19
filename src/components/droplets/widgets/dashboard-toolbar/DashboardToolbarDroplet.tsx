import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

// ══════════════════════════════════════════════════════════════════════════
// Local Type Definitions (non exported to avoid barrel conflicts)
// ══════════════════════════════════════════════════════════════════════════

interface TimeRangeOption {
    label: string;
    value: string;
}

interface SortOption {
    label: string;
    field: string;
    direction: 'asc' | 'desc';
}

// ══════════════════════════════════════════════════════════════════════════
// Droplet Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Data structure for DashboardToolbar
 * Contains current selections for time range and sorting
 */
interface DashboardToolbarData {
    /** Currently selected time range value */
    timeRange?: string;
    /** Currently selected sort option */
    sortOption?: SortOption;
}

/**
 * Component-specific props
 */
interface DashboardToolbarProps {
    /** Main title of the dashboard */
    title?: string;
    /** Optional subtitle */
    subtitle?: string;
    /** Icon displayed next to title */
    icon?: string;

    /** Available time range options */
    timeRangeOptions?: TimeRangeOption[];
    /** Label displayed next to calendar icon (e.g., "March 2026") */
    dateLabel?: string;
    /** Icon for date display */
    dateIcon?: string;

    /** Available sorting options */
    sortOptions?: SortOption[];

    /** Show customize button */
    showCustomize?: boolean;
    /** Customize button icon */
    customizeIcon?: string;

    /** Custom CSS class name */
    className?: string;
}

/**
 * Complete droplet definition
 */
type DashboardToolbarDropletDefinition = DropletDefinition<DashboardToolbarData> & {
    props?: DashboardToolbarProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * DashboardToolbarDroplet — Toolbar for dashboard pages.
 *
 * Features:
 * - Title with optional icon and subtitle
 * - Time range selector (e.g., "Last 30 days", "This month")
 * - Sorting selector
 * - Customize button
 *
 * Triggers:
 * - TimeRangeChanged: fired when time range selection changes
 * - SortChanged: fired when sort selection changes
 * - CustomizeClick: fired when customize button is clicked
 */
export const DashboardToolbarDroplet: DropletBuilderComponent<DashboardToolbarDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Triggers ────────────────────────────────────────────────────────────
    const timeRangeChangedTrigger = { type: 'system', name: `${definition.name}TimeRangeChanged`, enabled: true };
    const sortChangedTrigger = { type: 'system', name: `${definition.name}SortChanged`, enabled: true };
    const customizeClickTrigger = { type: 'system', name: `${definition.name}CustomizeClick`, enabled: true };

    useTriggerState(form, timeRangeChangedTrigger);
    useTriggerState(form, sortChangedTrigger);
    useTriggerState(form, customizeClickTrigger);

    const { handleTrigger: triggerTimeRangeChanged } = useTriggerActions(form, timeRangeChangedTrigger);
    const { handleTrigger: triggerSortChanged } = useTriggerActions(form, sortChangedTrigger);
    const { handleTrigger: triggerCustomizeClick } = useTriggerActions(form, customizeClickTrigger);

    // ── Early return check ──────────────────────────────────────────────────
    if (!droplet || droplet.visible === false) return null;

    // ── Data extraction ─────────────────────────────────────────────────────
    const data = droplet.value as DashboardToolbarData | undefined;
    const timeRange = data?.timeRange;
    const sortOption = data?.sortOption;

    // ── Props extraction ────────────────────────────────────────────────────
    const {
        title = 'Dashboard',
        subtitle,
        icon,
        timeRangeOptions,
        dateLabel,
        dateIcon = 'calendar',
        sortOptions,
        showCustomize = false,
        customizeIcon = 'settings',
        className,
    } = definition.props || {};

    // ── Options for Select components ───────────────────────────────────────
    const periodOptions = timeRangeOptions
        ? timeRangeOptions.map((opt) => ({ label: opt.label, value: opt.value }))
        : [];

    const sortSelectOptions = sortOptions
        ? sortOptions.map((opt) => ({
            label: opt.label,
            value: `${opt.field}-${opt.direction}`,
        }))
        : [];

    // ── Event Handlers ──────────────────────────────────────────────────────
    const handleTimeRangeChange = (details: { value: string[] }) => {
        (triggerTimeRangeChanged as (payload: unknown) => void)({ value: details.value[0] });
    };

    const handleSortChange = (details: { value: string[] }) => {
        const [field, direction] = details.value[0].split('-');
        const newSortOption: SortOption = {
            field,
            direction: direction as 'asc' | 'desc',
            label: sortOptions?.find(o => o.field === field && o.direction === direction)?.label || '',
        };
        (triggerSortChanged as (payload: unknown) => void)(newSortOption);
    };

    const handleCustomizeClick = () => {
        triggerCustomizeClick();
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className={`dashboard-toolbar ${className || ''}`}>
            {/* Left: Title & Subtitle */}
            <div className={icon ? 'dashboard-toolbar-info-with-icon' : 'dashboard-toolbar-info'}>
                <div className="dashboard-toolbar-title-row">
                    {icon && <Ark.Icon icon={icon} size="md" className="dashboard-toolbar-icon" />}
                    <Ark.Text as="h1" className="dashboard-toolbar-title">
                        {title}
                    </Ark.Text>
                </div>
                {subtitle && (
                    <Ark.Text as="p" className="dashboard-toolbar-subtitle">
                        {subtitle}
                    </Ark.Text>
                )}
            </div>

            {/* Right: Actions Toolbar */}
            <div className="dashboard-toolbar-actions">
                {/* Customize Button */}
                {showCustomize && (
                    <Ark.Button
                        onClick={handleCustomizeClick}
                        className="dashboard-toolbar-btn"
                        title="Customize"
                        aria-label="Customize Dashboard"
                        variant="ghost"
                        size="sm"
                        leftIcon={customizeIcon}
                    >
                        <></>
                    </Ark.Button>
                )}

                {/* Time Range Selector */}
                {timeRange && timeRangeOptions && timeRangeOptions.length > 0 && dateLabel && (
                    <div className="dashboard-toolbar-time-container">
                        <Ark.Text className="dashboard-toolbar-date-label">
                            <Ark.Icon icon={dateIcon} size="sm" className="text-gray-500" />
                            {dateLabel}
                        </Ark.Text>
                        <div className="dashboard-toolbar-select-wrapper">
                            <Ark.Select
                                options={periodOptions}
                                value={[timeRange]}
                                onValueChange={handleTimeRangeChange}
                                className="dashboard-toolbar-select"
                                size="sm"
                            />
                        </div>
                    </div>
                )}

                {/* Sort Selector */}
                {sortOption && sortOptions && sortOptions.length > 0 && (
                    <div className="dashboard-toolbar-select-wrapper">
                        <Ark.Select
                            options={sortSelectOptions}
                            value={[`${sortOption.field}-${sortOption.direction}`]}
                            onValueChange={handleSortChange}
                            className="dashboard-toolbar-select"
                            size="sm"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-dashboard-toolbar', DashboardToolbarDroplet);

export default DashboardToolbarDroplet;
