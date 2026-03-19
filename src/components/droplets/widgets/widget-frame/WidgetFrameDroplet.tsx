import { useMemo, useCallback, ReactNode } from 'react';
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

/**
 * Widget color theme variants
 */
type WidgetColorTheme = 'blue' | 'indigo' | 'slate' | 'default';

// ══════════════════════════════════════════════════════════════════════════
// Droplet Type Definitions
// ══════════════════════════════════════════════════════════════════════════

/**
 * Data structure for WidgetFrame
 * The value can contain any custom data relevant to the widget content
 */
interface WidgetFrameData {
    [key: string]: unknown;
}

/**
 * Component-specific props
 */
interface WidgetFrameProps {
    /** Widget title displayed in header */
    title?: string;
    /** Subtitle displayed below title */
    subtitle?: string;
    /** Icon name to show in header */
    icon?: string;
    /** Minimum height of the widget */
    minHeight?: string;
    /** Color theme variant */
    color?: WidgetColorTheme;
    /** Custom CSS class name */
    className?: string;
}

/**
 * Complete droplet definition
 */
type WidgetFrameDropletDefinition = DropletDefinition<WidgetFrameData> & {
    props?: WidgetFrameProps;
    /** Render function for header action button/content */
    headerAction?: ReactNode;
    /** Render function for additional header children */
    headerChildren?: ReactNode;
    /** Render function for main content */
    children?: ReactNode;
};

// ══════════════════════════════════════════════════════════════════════════
// Droplet Component
// ══════════════════════════════════════════════════════════════════════════

/**
 * WidgetFrameDroplet — Container frame per widget dashboard.
 *
 * Features:
 * - Header con titolo, sottotitolo, icona
 * - Tema colore configurabile (blue, indigo, slate, default)
 * - Area azioni header
 * - Contenuto children personalizzabile
 * - Glass card variant
 *
 * Triggers:
 * - Click: fired when widget frame is clicked
 */
export const WidgetFrameDroplet: DropletBuilderComponent<WidgetFrameDropletDefinition> = ({
    definition,
    form,
}) => {
    const droplet = useDropletState(form, definition);

    // ── Triggers ────────────────────────────────────────────────────────────
    const clickTriggerDef = useMemo(() => ({
        type: 'system',
        name: `${definition.name}Click`,
        enabled: true,
    }), [definition.name]);

    const clickTrigger = useTriggerState(form, clickTriggerDef);
    const { handleTrigger: triggerClick } = useTriggerActions(form, clickTriggerDef);

    // ── Props extraction ────────────────────────────────────────────────────
    const {
        title,
        subtitle,
        icon,
        minHeight,
        color = 'default',
        className,
    } = definition.props || {};

    // ── Memoized class names ────────────────────────────────────────────────
    const wrapperClass = useMemo(
        () => ['widget-frame-droplet', className].filter(Boolean).join(' '),
        [className]
    );

    // ── Event handlers ──────────────────────────────────────────────────────
    const handleClick = useCallback(() => {
        if (clickTrigger) {
            try {
                clickTrigger.signalData = {};
                triggerClick();
            } catch {
                // In design-time (editor) sendSignal actor may not be registered
            }
        }
    }, [clickTrigger, triggerClick]);

    // ── Early return check ──────────────────────────────────────────────────
    if (!droplet || droplet.visible === false) return null;

    // ── Empty state (visible in editor) ─────────────────────────────────────
    const displayTitle = title || definition.label || 'Widget Frame';
    const hasContent = definition.children != null;

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className={wrapperClass} onClick={handleClick}>
            <Ark.WidgetFrame
                title={displayTitle}
                subtitle={subtitle}
                icon={icon as never}
                headerAction={definition.headerAction}
                headerChildren={definition.headerChildren}
                minHeight={minHeight}
                color={color}
            >
                {hasContent ? (
                    definition.children
                ) : (
                    <div 
                        style={{ 
                            minHeight: minHeight || '120px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.875rem'
                        }}
                    >
                        Widget content area
                    </div>
                )}
            </Ark.WidgetFrame>
        </div>
    );
};

// ══════════════════════════════════════════════════════════════════════════
// Registration
// ══════════════════════════════════════════════════════════════════════════

dropletRegistry.register('tecnosys-widget-frame', WidgetFrameDroplet);

export default WidgetFrameDroplet;
