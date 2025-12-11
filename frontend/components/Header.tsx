'use client';

import {
  CSSProperties,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from 'react-oidc-context';
import {
  faCircleUser,
  faArrowRightFromBracket,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

import InfoMessageModal from '@/ui/InfoMessageModal';
import HeaderLogo from '@/ui/HeaderLogo';
import GenericButton from '@/ui/Buttons/GenericButton';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { useQuery } from '@tanstack/react-query';
import { getGeneralSettingsByTenant } from '@/api/general-settings-service';

type HeaderProps = {
  isLoginHeader?: boolean;
  isPublic?: boolean;
  headerColor: string;
  headerSecondaryColor: string;
  useColorTransitionHeader: boolean;
  fontColor: string;
  showLogo: boolean;
  dynamicHeadline: string;
  infoModalBackgroundColor: string;
  infoModalFontColor: string;
  informationTextFontColor?: string;
  informationTextFontSize?: string;
};

type BackgroundColorStyle =
  | { backgroundImage: string }
  | { backgroundColor: string };

export default function Header(props: HeaderProps): ReactElement {
  const {
    isLoginHeader = false,
    isPublic = false,
    headerColor,
    headerSecondaryColor,
    useColorTransitionHeader,
    fontColor,
    showLogo,
    dynamicHeadline,
    infoModalBackgroundColor,
    infoModalFontColor,
    informationTextFontColor,
    informationTextFontSize,
  } = props;
  const { isAuthenticated, signoutRedirect, signinRedirect } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const { push } = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const basepath = process.env.NEXT_PUBLIC_BASEPATH;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  // Admin role logic
  const auth = useAuth();
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const adminRole = process.env.NEXT_PUBLIC_ADMIN_ROLE;

  // Edit public dashboards
  const [allowEdit, setAllowEdit] = useState(
    Cookies.get('allowEdit') === 'true',
  );

  const handleAllowEditToggle = (): void => {
    const newValue = !allowEdit;
    setAllowEdit(newValue);
    Cookies.set('allowEdit', newValue.toString(), { path: '/' });
    window.location.reload(); // Reload to pick up updated cookie
  };

  useEffect(() => {
    if (auth && auth.user && auth.user?.access_token) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded: any = jwtDecode(auth?.user?.access_token);
      const roles = decoded.roles || decoded.realm_access?.roles;
      setRoleOptions(roles);
    }
  }, [auth]);

  const { data: generalSetting } = useQuery({
    queryKey: ['generalSettings'],
    queryFn: () => getGeneralSettingsByTenant(tenant),
  });

  // Tracking window size and adjust sidebar visibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = (): void => {
        setIsCollapsed(window.innerWidth < 800);
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  const tenant = getTenantOfPage();

  // Determine marginLeft based on isPublic and isCollapsed states
  const marginLeftValue = isPublic ? '0' : isCollapsed ? '80px' : '256px';

  const getBgColorForHeader = (): BackgroundColorStyle => {
    return useColorTransitionHeader
      ? {
          backgroundImage: `linear-gradient(to top right, ${headerColor}, ${headerSecondaryColor})`,
        }
      : {
          backgroundColor: headerColor || '#3D4760',
        };
  };

  // Define dynamic menu colors
  const headerstyle: CSSProperties = {
    ...getBgColorForHeader(),
    marginLeft: marginLeftValue,
    color: fontColor || '#fff',
  };

  const handleExitButtonClicked = (): void => {
    const deleteCookie = (name: string): void => {
      document.cookie = `${name}=; Max-Age=0; path=/;`;
    };

    deleteCookie('access_token');
    deleteCookie('allowEdit');

    if (basepath !== undefined) {
      signoutRedirect({
        post_logout_redirect_uri: `${window.location.origin}${basepath}/${tenant}`,
      });
    } else {
      signoutRedirect({
        post_logout_redirect_uri: `${window.location.origin}/${tenant}`,
      });
    }
  };

  const handleUserIconClick = (): void => {
    if (!isAuthenticated) {
      signinRedirect({
        state: pathname,
      }).catch((err) => {
        console.error('Failed to redirect to login:', err);
      });
    }
  };

  const handleInfoButtonClicked = (): void => {
    setIsModalVisible((prev) => !prev);
    setDropdownOpen(false);
  };

  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
    setIsModalVisible(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        loginRef.current &&
        !loginRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loginRef]);

  return (
    <div
      style={headerstyle}
      className="flex shrink-0 justify-between h-16 z-30"
    >
      <div className="flex items-center">
        {showLogo && (
          <div className="p-3">
            <HeaderLogo />
          </div>
        )}
        <p className="text-md ml-9 sm:text-xl leading-7">{dynamicHeadline}</p>
      </div>
      <div className="flex items-center z-30">
        {!isLoginHeader ? (
          <div className="mr-6">
            {isAuthenticated ? (
              <div className="flex gap-4">
                {!pathname.includes('/admin') ? (
                  <>
                    <div className="justify-center items-center content-center">
                      <button
                        type="button"
                        aria-label="Informationen"
                        onClick={handleInfoButtonClicked}
                      >
                        <FontAwesomeIcon
                          icon={faExclamationCircle}
                          size="lg"
                        ></FontAwesomeIcon>
                      </button>
                    </div>
                    <InfoMessageModal
                      isVisible={isModalVisible}
                      headline={'Information'}
                      message={generalSetting?.disclaimer || ''}
                      infoModalBackgroundColor={infoModalBackgroundColor}
                      infoModalFontColor={infoModalFontColor}
                      informationTextFontColor={
                        informationTextFontColor || '#3D4760'
                      }
                      informationTextFontSize={informationTextFontSize || '11'}
                      onClose={(): void => setIsModalVisible(false)}
                    />
                    {adminRole && roleOptions.includes(adminRole) ? (
                      <div className="hidden sm:flex">
                        <GenericButton
                          label="Admin"
                          handleClick={(): void => {
                            push(tenant ? `/${tenant}/admin` : '/admin');
                          }}
                          fontColor={headerstyle.color || '#FFFFFF'}
                        />
                        <div className="flex items-center ml-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={allowEdit}
                              onChange={handleAllowEditToggle}
                              className="w-10 h-5 bg-gray-300 rounded-full relative appearance-none cursor-pointer transition-all checked:bg-green-500"
                            />
                            <span className="text-sm text-white">
                              Bearbeiten
                            </span>
                          </label>
                        </div>
                      </div>
                    ) : null}
                  </>
                ) : null}
                <button onClick={handleExitButtonClicked}>
                  <FontAwesomeIcon icon={faArrowRightFromBracket} size="lg" />
                </button>
              </div>
            ) : (
              // Show user icon with dropdown for login and info message when not authenticated
              <div className="flex">
                <div className="mr-6">
                  <button
                    type="button"
                    aria-label="Informationen"
                    onClick={handleInfoButtonClicked}
                  >
                    <FontAwesomeIcon
                      icon={faExclamationCircle}
                      size="lg"
                    ></FontAwesomeIcon>
                  </button>
                </div>
                <InfoMessageModal
                  isVisible={isModalVisible}
                  headline={'Information'}
                  message={generalSetting?.disclaimer || ''}
                  infoModalBackgroundColor={infoModalBackgroundColor}
                  infoModalFontColor={infoModalFontColor}
                  informationTextFontColor={
                    informationTextFontColor || '#3D4760'
                  }
                  informationTextFontSize={informationTextFontSize || '11'}
                  onClose={(): void => setIsModalVisible(false)}
                />
                <div className="cursor-pointer" ref={loginRef}>
                  <div onClick={toggleDropdown}>
                    <FontAwesomeIcon icon={faCircleUser} size="lg" />
                    {dropdownOpen && (
                      <div
                        className="fixed mt-2 right-6 bg-white shadow-md rounded px-4 py-2 z-30"
                        onClick={handleUserIconClick} // Directly invoke login on click
                      >
                        <button className="text-black">Login</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
