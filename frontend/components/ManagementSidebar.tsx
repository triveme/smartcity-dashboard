import { CSSProperties, ReactElement } from 'react';

import SidebarContent from './SidebarContent';
import SidebarFooter from './SidebarFooter';
import { SidebarItemStyle } from './SidebarItem';

type ManagementSidebarProps = {
  backgroundColor: string;
  backgroundSecondaryColor: string;
  useColorTransitionMenu: boolean;
  sidebarItemStyle: SidebarItemStyle;
};

type BackgroundColorStyle =
  | { backgroundImage: string }
  | { backgroundColor: string };

export default function ManagementSidebar(
  props: ManagementSidebarProps,
): ReactElement {
  const {
    backgroundColor,
    backgroundSecondaryColor,
    useColorTransitionMenu,
    sidebarItemStyle,
  } = props;

  const getBgColorForMenu = (): BackgroundColorStyle => {
    return useColorTransitionMenu
      ? {
          backgroundImage: `linear-gradient(to right, ${backgroundColor}, ${backgroundSecondaryColor})`,
        }
      : {
          backgroundColor: backgroundColor || '#1D2330',
        };
  };

  // Define dynamic menu colors
  const componentStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '256px',
    ...getBgColorForMenu(),
    overflowY: 'auto',
    // color: '#fff',
    zIndex: 20,
  };

  return (
    <div style={componentStyle} className="flex flex-col shrink-0 h-screen">
      <SidebarContent
        sidebarItemStyle={sidebarItemStyle}
        useColorTransitionMenu={useColorTransitionMenu}
      />
      <SidebarFooter />
    </div>
  );
}
