import { useEffect, useRef } from 'react';
import {
    DropletDefinition,
    dropletRegistry,
} from '@tecnosys/stillum-forms-core';
import {
    DropletBuilderComponent,
    useDropletState,
    useDropletActions,
    useTriggerState,
    useTriggerActions,
} from '@tecnosys/stillum-forms-react';
import { Ark } from '@tecnosys/components';

// ══════════════════════════════════════════════════════════════════════════
// Local Type Definitions (non exported to avoid barrel conflicts)
// ══════════════════════════════════════════════════════════════════════════

interface LeaderboardItemValue {
    key: string;
    value: string | number;
    subValue?: string;
    color?: 'default' | 'success' | 'error' | 'warning' | 'muted';
}

interface LeaderboardItem {
    id: string;
    rank?: number;
    title: string;
    subtitle?: string;
    avatarSrc?: string;
    values: LeaderboardItemValue[];
}

interface LeaderboardColumn {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    width?: string;
    sortable?: boolean;
}

// ══════════════════════════════════════════════════════════════════════════
// Droplet Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Data structure for LeaderboardWidget
 */
interface LeaderboardWidgetData {
    /** List of leaderboard items */
    items?: LeaderboardItem[];
    /** Column definitions */
    columns?: LeaderboardColumn[];
    /** Current search term */
    searchTerm?: string;
    /** Active sort column key */
    activeSortKey?: string;
    /** Sort direction */
    sortDirection?: 'asc' | 'desc';
    /** Whether more items are being loaded */
    isLoadingMore?: boolean;
}

/**
 * Component-specific props
 */
interface LeaderboardWidgetProps {
    /** Widget title */
    title?: string;
    /** Widget subtitle */
    subtitle?: string;
    /** Widget icon */
    icon?: string;
    /** Minimum height */
    minHeight?: string;
    /** Search input placeholder */
    searchPlaceholder?: string;
    /** Search icon */
    searchIcon?: string;
    /** Sort ascending icon */
    sortAscIcon?: string;
    /** Sort descending icon */
    sortDescIcon?: string;
    /** Empty state text */
    emptyText?: string;
    /** Show export button */
    showExport?: boolean;
    /** Show search input */
    showSearch?: boolean;
    /** Custom CSS class name */
    className?: string;
}

/**
 * Complete droplet definition
 */
type LeaderboardWidgetDropletDefinition = DropletDefinition<LeaderboardWidgetData> & {
    props?: LeaderboardWidgetProps;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * LeaderboardWidgetDroplet — Leaderboard/ranking widget with search, sorting, and infinite scroll.
 *
 * Features:
 * - Ranked list with medals for top 3
 * - Multiple value columns per row
 * - Search functionality
 * - Column sorting
 * - Infinite scroll loading
 * - Export capability
 *
 * Triggers:
 * - SearchChanged: fired when search term changes
 * - SortChanged: fired when sort column/direction changes
 * - ItemClick: fired when an item is clicked
 * - LoadMore: fired when infinite scroll triggers
 * - Export: fired when export button is clicked
 */
export const LeaderboardWidgetDroplet: DropletBuilderComponent<LeaderboardWidgetDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);
    const { updateValue } = useDropletActions(form, definition);
    const observerTarget = useRef<HTMLDivElement>(null);

    // ── Triggers ────────────────────────────────────────────────────────────
    const searchChangedTrigger = { type: 'system', name: `${definition.name}SearchChanged`, enabled: true };
    const sortChangedTrigger = { type: 'system', name: `${definition.name}SortChanged`, enabled: true };
    const itemClickTrigger = { type: 'system', name: `${definition.name}ItemClick`, enabled: true };
    const loadMoreTrigger = { type: 'system', name: `${definition.name}LoadMore`, enabled: true };
    const exportTrigger = { type: 'system', name: `${definition.name}Export`, enabled: true };

    useTriggerState(form, searchChangedTrigger);
    useTriggerState(form, sortChangedTrigger);
    useTriggerState(form, itemClickTrigger);
    useTriggerState(form, loadMoreTrigger);
    useTriggerState(form, exportTrigger);

    const { handleTrigger: triggerSearchChanged } = useTriggerActions(form, searchChangedTrigger);
    const { handleTrigger: triggerSortChanged } = useTriggerActions(form, sortChangedTrigger);
    const { handleTrigger: triggerItemClick } = useTriggerActions(form, itemClickTrigger);
    const { handleTrigger: triggerLoadMore } = useTriggerActions(form, loadMoreTrigger);
    const { handleTrigger: triggerExport } = useTriggerActions(form, exportTrigger);

    // ── Data extraction ─────────────────────────────────────────────────────
    const data = droplet?.value as LeaderboardWidgetData | undefined;
    const items = data?.items || [];
    const columns = data?.columns || [];
    const searchTerm = data?.searchTerm || '';
    const activeSortKey = data?.activeSortKey;
    const sortDirection = data?.sortDirection || 'asc';
    const isLoadingMore = data?.isLoadingMore || false;

    // ── Props extraction ────────────────────────────────────────────────────
    const {
        title = 'Leaderboard',
        subtitle,
        icon,
        minHeight = 'h-auto md:h-[560px]',
        searchPlaceholder = 'Search...',
        searchIcon = 'search',
        sortAscIcon = 'chevron-up',
        sortDescIcon = 'chevron-down',
        emptyText = 'No results found.',
        showExport = false,
        showSearch = true,
        className,
    } = definition.props || {};

    // ── Infinite Scroll Observer ────────────────────────────────────────────
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingMore) {
                    triggerLoadMore();
                }
            },
            { threshold: 0.1 }
        );

        const target = observerTarget.current;
        if (target) {
            observer.observe(target);
        }

        return () => {
            if (target) {
                observer.unobserve(target);
            }
        };
    }, [isLoadingMore, triggerLoadMore]);

    // ── Early return check ──────────────────────────────────────────────────
    if (!droplet || droplet.visible === false) return null;

    // ── Event Handlers ──────────────────────────────────────────────────────
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        updateValue({ ...data, searchTerm: value });
        (triggerSearchChanged as (payload: unknown) => void)({ value });
    };

    const handleSortChange = (key: string) => {
        const newDirection = activeSortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
        updateValue({ ...data, activeSortKey: key, sortDirection: newDirection });
        (triggerSortChanged as (payload: unknown) => void)({ key, direction: newDirection });
    };

    const handleItemClick = (item: LeaderboardItem) => {
        (triggerItemClick as (payload: unknown) => void)(item);
    };

    const handleExport = () => {
        (triggerExport as (payload: unknown) => void)({ format: 'csv' });
    };

    // ── Render Header Children (Search) ─────────────────────────────────────
    const renderHeaderChildren = () => {
        if (!showSearch) return undefined;

        return (
            <div className="leaderboard-widget-search-container">
                <Ark.TextInput
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="leaderboard-widget-search-input"
                    leftIcon={searchIcon}
                />
            </div>
        );
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <Ark.WidgetFrame
            title={title}
            subtitle={subtitle}
            icon={icon}
            minHeight={minHeight}
            className={className}
            headerChildren={renderHeaderChildren()}
            headerAction={
                showExport ? (
                    <Ark.Button
                        onClick={handleExport}
                        variant="ghost"
                        size="sm"
                        leftIcon="download"
                        aria-label="Export data"
                    >
                        Export
                    </Ark.Button>
                ) : undefined
            }
        >
            <div className="flex flex-col h-full">
                {/* Columns Header */}
                <div className="leaderboard-widget-header-row">
                    <div className="leaderboard-widget-header-col-rank">#</div>
                    <div className="leaderboard-widget-header-col-main">
                        {columns[0]?.label || 'Name'}
                    </div>

                    {columns.slice(1).map((col) => (
                        <div
                            key={col.key}
                            className={`w-${col.width || '20'} text-${col.align || 'right'}`}
                        >
                            {col.sortable ? (
                                <Ark.Button
                                    onClick={() => handleSortChange(col.key)}
                                    variant="ghost"
                                    size="xs"
                                    className={`leaderboard-widget-sort-btn ${activeSortKey === col.key ? 'leaderboard-widget-sort-btn-active' : ''}`}
                                >
                                    <Ark.Text as="span">{col.label}</Ark.Text>
                                    {activeSortKey === col.key && (
                                        <Ark.Icon
                                            icon={sortDirection === 'asc' ? sortAscIcon : sortDescIcon}
                                            size="xs"
                                            className="ml-1"
                                        />
                                    )}
                                </Ark.Button>
                            ) : (
                                <Ark.Text as="span">{col.label}</Ark.Text>
                            )}
                        </div>
                    ))}
                </div>

                {/* List Items */}
                <div className="leaderboard-widget-list-container">
                    <div className="flex flex-col gap-1">
                        {items.length > 0 ? (
                            items.map((item, index) => {
                                const rankClass =
                                    item.rank === 1
                                        ? 'leaderboard-item-rank-1'
                                        : item.rank === 2
                                            ? 'leaderboard-item-rank-2'
                                            : item.rank === 3
                                                ? 'leaderboard-item-rank-3'
                                                : 'leaderboard-item-rank-default';

                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => handleItemClick(item)}
                                        className="leaderboard-item group"
                                    >
                                        {/* Rank */}
                                        <div className={`leaderboard-item-rank ${rankClass}`}>
                                            {item.rank || index + 1}
                                        </div>

                                        {/* Main Info */}
                                        <div className="leaderboard-item-info">
                                            <div className="leaderboard-item-title">{item.title}</div>
                                            <div className="leaderboard-item-subtitle">
                                                {item.avatarSrc && (
                                                    <Ark.Avatar
                                                        src={item.avatarSrc}
                                                        alt={item.title}
                                                        size="xs"
                                                    />
                                                )}
                                                <Ark.Text as="span" className="truncate">
                                                    {item.subtitle}
                                                </Ark.Text>
                                            </div>
                                        </div>

                                        {/* Dynamic Values Columns */}
                                        {item.values.map((val, vIdx) => (
                                            <div
                                                key={vIdx}
                                                className={`w-${columns[vIdx + 1]?.width || '20'} text-${columns[vIdx + 1]?.align || 'right'}`}
                                            >
                                                <div
                                                    className={`leaderboard-item-value ${val.color ? `text-${val.color}-500` : 'text-gray-600 dark:text-slate-300'}`}
                                                >
                                                    {val.value}
                                                </div>
                                                {val.subValue && (
                                                    <Ark.Text as="span" className="leaderboard-item-subvalue">
                                                        {val.subValue}
                                                    </Ark.Text>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="leaderboard-item-empty">
                                <Ark.Text as="span" className="text-xs font-medium">
                                    {emptyText}
                                </Ark.Text>
                            </div>
                        )}
                    </div>

                    {/* Loading Sentinel */}
                    <div ref={observerTarget} className="leaderboard-widget-loader-container">
                        {isLoadingMore && (
                            <Ark.Text as="span" className="text-xs text-gray-400">
                                Loading...
                            </Ark.Text>
                        )}
                    </div>
                </div>
            </div>
        </Ark.WidgetFrame>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-leaderboard-widget', LeaderboardWidgetDroplet);

export default LeaderboardWidgetDroplet;
