import { useState, useMemo } from 'react';
import { poolRegistry, PoolDefinition, TriggerDefinition } from '@tecnosys/stillum-forms-core';
import { PoolBuilderComponent, useTriggerActions, useTriggerState } from '@tecnosys/stillum-forms-react';
import { Tailwind, LayoutMode, Theme, MinimizedModalItem, Ark } from '@tecnosys/components';

const { MainAppLayout } = Tailwind;

interface MainLayoutDataContext {
  isAuthenticated?: boolean;
  initialActiveTabIds?: string[];
  currentSideBarId?: string;
  userProfile?: Tailwind.UserProfileProps;
  notificationData?: Tailwind.NotificationBellProps;
  sidebarItems?: Tailwind.MainAppLayoutItem[];
  bottomItems?: Tailwind.MainAppLayoutItem[];
  searchQuickActions?: Tailwind.QuickAction[];
  fullTextSearchData?: Ark.FullTextSearchList;
  minimizedItems?: MinimizedModalItem[];
}

export type MainLayoutPoolDefinition = PoolDefinition & {
  props?: Partial<Tailwind.MainAppLayoutProps>;
  triggers?: {
    name: string;
    type?: string;
    [key: string]: any;
  }[];
};

const MainLayoutPool: PoolBuilderComponent<MainLayoutPoolDefinition> = ({
  definition,
  form,
  PoolsTag,
  DropletsTag,
  TriggersTag,
  WebSocketTag,
}) => {
  const props = definition.props || {};
  const mainLayoutDataContext = form?.getDataContext() as MainLayoutDataContext;
  const [currentContentId, setCurrentContentId] = useState<string | undefined>(
    mainLayoutDataContext?.currentSideBarId,
  );

  const definitionPool = useMemo(() => {
    if (!currentContentId) return undefined;
    return {
      name: currentContentId,
      type: 'tecnosys-container',
      webSocket: {
        id: currentContentId,
      },
    };
  }, [currentContentId]);

  const triggerDefinition = (triggerName: string): TriggerDefinition => {
    return {
      type: 'system',
      name: `${definition.name}${triggerName}`,
      enabled: true,
    };
  };

  const activeTabChangeDefinition = triggerDefinition('ActiveTabChange');
  const activeTabChangeTrigger = useTriggerState(form, activeTabChangeDefinition);
  const { handleTrigger: handleActiveTabChangeTrigger } = useTriggerActions(
    form,
    activeTabChangeDefinition,
  );
  const handleActiveTabChange = (tab: Tailwind.MainAppLayoutItem) => {
    if (tab?.id) {
      setCurrentContentId(tab.id);
    }
    if (!activeTabChangeTrigger) return;
    activeTabChangeTrigger.signalData = tab?.id;
    handleActiveTabChangeTrigger();
  };

  const logoutDefinition = triggerDefinition('Logout');
  const logoutTrigger = useTriggerState(form, logoutDefinition);
  const { handleTrigger: handleLogoutTrigger } = useTriggerActions(form, logoutDefinition);
  const handleLogout = () => {
    if (!logoutTrigger) return;
    logoutTrigger.signalData = true;
    handleLogoutTrigger();
  };

  const themeChangeDefinition = triggerDefinition('ThemeChange');
  const themeChangeTrigger = useTriggerState(form, themeChangeDefinition);
  const { handleTrigger: handleThemeChangeTrigger } = useTriggerActions(
    form,
    themeChangeDefinition,
  );
  const handleThemeChange = (theme: Theme) => {
    if (!themeChangeTrigger) return;
    themeChangeTrigger.signalData = theme;
    handleThemeChangeTrigger();
  };

  const layoutModeChangeDefinition = triggerDefinition('LayoutModeChange');
  const layoutModeChangeTrigger = useTriggerState(form, layoutModeChangeDefinition);
  const { handleTrigger: handleLayoutModeChangeTrigger } = useTriggerActions(
    form,
    layoutModeChangeDefinition,
  );
  const handleLayoutModeChange = (layoutMode: LayoutMode) => {
    if (!layoutModeChangeTrigger) return;
    layoutModeChangeTrigger.signalData = layoutMode;
    handleLayoutModeChangeTrigger();
  };

  const languageChangeDefinition = triggerDefinition('LanguageChange');
  const languageChangeTrigger = useTriggerState(form, languageChangeDefinition);
  const { handleTrigger: handleLanguageChangeTrigger } = useTriggerActions(
    form,
    languageChangeDefinition,
  );
  const handleLanguageChange = (language: 'it' | 'en' | 'de') => {
    if (!languageChangeTrigger) return;
    languageChangeTrigger.signalData = language;
    handleLanguageChangeTrigger();
  };

  const searchDefinition = triggerDefinition('Search');
  const searchTrigger = useTriggerState(form, searchDefinition);
  const { handleTrigger: handleSearchTrigger } = useTriggerActions(form, searchDefinition);
  const handleSearch = async (query: string): Promise<Tailwind.FullTextSearchList | null> => {
    if (searchTrigger) {
      searchTrigger.signalData = query;
      handleSearchTrigger();
    }
    return mainLayoutDataContext?.fullTextSearchData ?? null;
  };

  const searchItemClickDefinition = triggerDefinition('SearchItemClick');
  const searchItemClickTrigger = useTriggerState(form, searchItemClickDefinition);
  const { handleTrigger: handleSearchItemClickTrigger } = useTriggerActions(
    form,
    searchItemClickDefinition,
  );
  const handleSearchItemClick = (item: Tailwind.FullTextSearchItem, groupId: string) => {
    if (!searchItemClickTrigger) return;
    searchItemClickTrigger.signalData = { item, groupId };
    handleSearchItemClickTrigger();
  };

  const searchViewAllClickDefinition = triggerDefinition('SearchViewAllClick');
  const searchAdvancedSearchClickTrigger = useTriggerState(form, searchViewAllClickDefinition);
  const { handleTrigger: handleSearchAdvancedSearchClickTrigger } = useTriggerActions(
    form,
    searchViewAllClickDefinition,
  );
  const handleSearchAdvancedSearchClick = (group: Tailwind.FullTextSearchGroup) => {
    if (!searchAdvancedSearchClickTrigger) return;
    searchAdvancedSearchClickTrigger.signalData = group;
    handleSearchAdvancedSearchClickTrigger();
  };

  const quickActionClickDefinition = triggerDefinition('QuickActionClick');
  const quickActionClickTrigger = useTriggerState(form, quickActionClickDefinition);
  const { handleTrigger: handleQuickActionClickTrigger } = useTriggerActions(
    form,
    quickActionClickDefinition,
  );
  const handleQuickActionClick = (quickAction: string) => {
    if (!quickActionClickTrigger) return;
    quickActionClickTrigger.signalData = quickAction;
    handleQuickActionClickTrigger();
  };

  const tabClickDefinition = triggerDefinition('TabClick');
  const tabClickTrigger = useTriggerState(form, tabClickDefinition);
  const { handleTrigger: handleTabClickTrigger } = useTriggerActions(form, tabClickDefinition);
  const handleTabClick = (id: string) => {
    if (!tabClickTrigger) return;
    tabClickTrigger.signalData = id;
    handleTabClickTrigger();
  };

  const tabCloseDefinition = triggerDefinition('TabClose');
  const tabCloseTrigger = useTriggerState(form, tabCloseDefinition);
  const { handleTrigger: handleTabCloseTrigger } = useTriggerActions(form, tabCloseDefinition);
  const handleTabClose = (id: string) => {
    if (!tabCloseTrigger) return;
    tabCloseTrigger.signalData = id;
    handleTabCloseTrigger();
  };

  const notificationFilterExpiringDefinition = triggerDefinition('NotificationFilterExpiring');
  const notificationFilterExpiringTrigger = useTriggerState(
    form,
    notificationFilterExpiringDefinition,
  );
  const { handleTrigger: handleNotificationFilterExpiringTrigger } = useTriggerActions(
    form,
    notificationFilterExpiringDefinition,
  );
  const handleNotificationFilterExpiring = () => {
    if (!notificationFilterExpiringTrigger) return;
    notificationFilterExpiringTrigger.signalData = true;
    handleNotificationFilterExpiringTrigger();
  };

  const notificationItemClickDefinition = triggerDefinition('NotificationItemClick');
  const notificationItemClickTrigger = useTriggerState(form, notificationItemClickDefinition);
  const { handleTrigger: handleNotificationItemClickTrigger } = useTriggerActions(
    form,
    notificationItemClickDefinition,
  );
  const handleNotificationItemClick = (id: string) => {
    if (!notificationItemClickTrigger) return;
    notificationItemClickTrigger.signalData = id;
    handleNotificationItemClickTrigger();
  };

  const notificationClearDefinition = triggerDefinition('NotificationClear');
  const notificationClearTrigger = useTriggerState(form, notificationClearDefinition);
  const { handleTrigger: handleNotificationClearTrigger } = useTriggerActions(
    form,
    notificationClearDefinition,
  );
  const handleNotificationClear = () => {
    if (!notificationClearTrigger) return;
    notificationClearTrigger.signalData = true;
    handleNotificationClearTrigger();
  };

  return (
    <MainAppLayout
      isAuthenticated={mainLayoutDataContext?.isAuthenticated}
      userProfile={mainLayoutDataContext?.userProfile}
      notificationData={mainLayoutDataContext?.notificationData}
      sidebarItems={mainLayoutDataContext?.sidebarItems}
      bottomItems={mainLayoutDataContext?.bottomItems}
      initialActiveTabIds={mainLayoutDataContext?.initialActiveTabIds}
      currentSideBarId={mainLayoutDataContext?.currentSideBarId}
      minimizedItems={mainLayoutDataContext?.minimizedItems}
      // Events
      onSearch={handleSearch}
      onSearchItemClick={handleSearchItemClick}
      onSearchAdvancedSearchClick={handleSearchAdvancedSearchClick}
      onQuickActionClick={handleQuickActionClick}
      onThemeChange={handleThemeChange}
      onLayoutModeChange={handleLayoutModeChange}
      onLanguageChange={handleLanguageChange}
      onLogout={handleLogout}
      onTabClick={handleTabClick}
      onTabClose={handleTabClose}
      onActiveTabChange={handleActiveTabChange}
      // Notification Events
      onNotificationFilterExpiring={handleNotificationFilterExpiring}
      onNotificationItemClick={handleNotificationItemClick}
      onNotificationClear={handleNotificationClear}
      // Branding
      title={props.title}
      subtitle={props.subtitle}
      logo={props.logo || 'Shield'}
    >
      {DropletsTag && <DropletsTag />}
      {TriggersTag && <TriggersTag />}
      {PoolsTag && <PoolsTag />}
      {WebSocketTag && <WebSocketTag />}
    </MainAppLayout>
  );
};

poolRegistry.register('tecnosys-main-layout', MainLayoutPool);

export default MainLayoutPool;
