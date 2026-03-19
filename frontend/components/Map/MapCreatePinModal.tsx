import React, {
  ReactElement,
  CSSProperties,
  useState,
  useRef,
  useEffect,
  useMemo,
} from 'react';
import type { Map as LeafletMap } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAnglesLeft,
  faMapPin,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { determineIsMobileView } from '@/app/custom-hooks/isMobileView';
import { usePreventMapScroll } from '@/app/custom-hooks/usePreventMapScroll';
import { CorporateInfo, QueryDataWithAttributes } from '@/types';
import { projectCategoryEnum, projectStatusEnum } from '@/types/enums';
import { projectStatusOptions } from '@/utils/enumMapper';
import { env } from 'next-dynenv';
import { useAuth } from 'react-oidc-context';
import {
  createProject,
  uploadProjectPicture,
  updateProject,
  getProjectPictures,
  deleteProjectPicture,
} from '../../api/project-service';
import type { NewProject, Project } from '@/types/dataModels';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import ImageLightbox from '@/ui/ImageLightbox';

const MAX_DESCRIPTION_LENGTH = 2000;

type MapboxSuggestion = {
  id?: string;
  place_name?: string;
  text?: string;
  center?: [number, number];
};

type MapboxContextItem = {
  id?: string;
  text?: string;
};

type ProjectPictureData = {
  id?: string | number;
  data?: string;
};

type ProjectDetails = Record<string, unknown> & {
  id?: { value?: string | number } | string | number;
  name?: unknown;
  title?: unknown;
  description?: unknown;
  category?: unknown;
  status?: unknown;
  cost?: unknown;
  district?: unknown;
  street_name?: unknown;
  street?: unknown;
  contact_person?: unknown;
  contact?: unknown;
  is_public?: unknown;
  public?: unknown;
  isPublic?: unknown;
  start_date?: unknown;
  startDate?: unknown;
  end_date?: unknown;
  endDate?: unknown;
  location?: { coordinates?: [number, number] };
  line_locations?: unknown;
  lineLocations?: unknown;
};

type ProjectInput = Record<string, unknown> & {
  details?: ProjectDetails;
  id?: { value?: string | number } | string | number;
  position?: [number, number];
  location?: { coordinates?: [number, number] };
  line_locations?: unknown;
  lineLocations?: unknown;
};

type MapCreatePinModalProps = {
  combinedQueryData?: QueryDataWithAttributes[];
  menuStyle?: CSSProperties;
  ciColors?: CorporateInfo;
  onCloseModal: () => void;
  isFullscreenMap?: boolean;
  mapNames?: string[];
  handleMapNameFilterChange?: (mapIndex: number, checked: boolean) => void;
  selectedDataSources?: number[];
  onSelectCoordinates?: (
    coords: { lat: number; lng: number; label?: string } | null,
  ) => void;
  onSelectRoute?: (points: { lat: number; lng: number }[]) => void;
  onRequestCenterPinVisibility?: (visible: boolean) => void;
  onProjectCreated?: (project: unknown) => void;
  initialData?: ProjectInput | null;
};

export default function MapCreatePinModal(
  props: MapCreatePinModalProps,
): ReactElement {
  const {
    menuStyle,
    ciColors,
    onCloseModal,
    isFullscreenMap,
    onSelectCoordinates,
    onRequestCenterPinVisibility,
    onSelectRoute,
    onProjectCreated,
    initialData,
  } = props;

  const isMobileView = determineIsMobileView();
  const scrollRef = usePreventMapScroll();
  const tenant = getTenantOfPage();
  const { data: corporateInfo } = useQuery({
    queryKey: ['corporate-info', tenant],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: Boolean(tenant),
  });
  const effectiveCiColors = corporateInfo || ciColors;
  const tenantAbbreviation = useMemo(() => tenant || null, [tenant]);
  const isEdit = Boolean(initialData);

  // State for toggling between Address and Map selection
  const [activeMethod, setActiveMethod] = useState<'address' | 'map' | 'route'>(
    initialData ? 'map' : 'address',
  );
  const [routePoints, setRoutePoints] = useState<
    { lat: number; lng: number }[]
  >([]);

  const getFilterModalStyle = (): CSSProperties => {
    if (isFullscreenMap && !isMobileView) {
      return {
        height: 'calc(100% - 9rem)',
        margin: '0.5rem',
        left: '19rem',
        width: '30rem', // Slightly wider to fit form comfortably
        zIndex: 1000,
        fontSize: '1rem',
        position: 'fixed',
      };
    } else if (isFullscreenMap && isMobileView) {
      return {
        height: 'calc(100% - 6rem)',
        margin: '0.5rem',
        left: '3rem',
        width: '25rem',
        position: 'relative',
        zIndex: 1000,
        top: '0',
      };
    } else if (!isFullscreenMap && !isMobileView) {
      return {
        height: 'calc(100% - 6rem)',
        margin: '0.5rem',
        left: '3rem',
        width: '25rem',
        zIndex: 1000,
        position: 'absolute',
        top: '0',
      };
    } else {
      // Map panel widget and mobile view
      return {
        height: 'calc(100% - 7rem)',
        margin: '0.5rem',
        left: '0.25rem',
        width: '25rem',
        zIndex: 1000,
        position: 'absolute',
        top: '0',
      };
    }
  };

  // Helper function to make sure touch input is being handled correctly
  const handleTouchStart = (e: React.TouchEvent): void => {
    e.stopPropagation();
  };

  const handleMouseDownCapture = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

  const handleDoubleClickCapture = (e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const primaryColor = effectiveCiColors?.headerPrimaryColor || '#005ea8';
  const menuPrimaryColor = effectiveCiColors?.menuPrimaryColor || primaryColor;
  const panelPrimaryColor =
    effectiveCiColors?.panelPrimaryColor || primaryColor;
  const fontColor = effectiveCiColors?.fontColor || '#FFFFFF';
  const secondaryColor = effectiveCiColors?.cancelButtonColor || '#e86c44';
  const headerSecondaryColor =
    effectiveCiColors?.headerSecondaryColor || secondaryColor;
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [existingPictures, setExistingPictures] = useState<
    { id: string; data: string }[]
  >([]);
  const [removedPictureIds, setRemovedPictureIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState('');
  const [cost, setCost] = useState('');
  const [district, setDistrict] = useState('');
  const districtTouchedRef = useRef(false);
  const [streetName, setStreetName] = useState('');
  const streetNameTouchedRef = useRef(false);
  const [contactPerson, setContactPerson] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentStep, setCurrentStep] = useState<number>(initialData ? 2 : 1);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');
  // address search state (Mapbox)
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const searchTimer = useRef<number | undefined>(undefined);
  useEffect(() => {
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, []);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [positionSet, setPositionSet] = useState(initialData ? true : false);
  const lastStreetLookupRef = useRef<string | null>(null);

  const reverseGeocodeAddress = async (
    lat: number,
    lng: number,
  ): Promise<{ street?: string; district?: string } | null> => {
    try {
      const token = env('NEXT_PUBLIC_MAPBOX_TOKEN');
      if (!token) return null;
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address&limit=1`,
      );
      if (!res.ok) return null;
      const data = await res.json();
      const feature = data?.features?.[0];
      if (!feature) return null;
      const street = feature?.text || feature?.place_name;
      const context: MapboxContextItem[] = Array.isArray(feature?.context)
        ? feature.context
        : [];
      const districtEntry = context.find(
        (item) =>
          typeof item?.id === 'string' && item.id.startsWith('district'),
      );
      const placeEntry = context.find(
        (item) => typeof item?.id === 'string' && item.id.startsWith('place'),
      );
      const district = districtEntry?.text || placeEntry?.text;
      return {
        street: street || undefined,
        district: district || undefined,
      };
    } catch (err) {
      console.error('Reverse geocode failed', err);
      return null;
    }
  };

  const normalizeDistrict = (value: string): string => {
    return value.replace(/^\s*Kreis\s+/i, '').trim();
  };

  useEffect(() => {
    if (streetNameTouchedRef.current && districtTouchedRef.current) return;

    const coords = activeMethod === 'route' ? routePoints[0] : selectedCoords;

    if (!coords) return;

    const key = `${activeMethod}:${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;
    if (lastStreetLookupRef.current === key) return;
    lastStreetLookupRef.current = key;

    reverseGeocodeAddress(coords.lat, coords.lng).then((result) => {
      if (!result) return;
      if (!streetNameTouchedRef.current && result.street) {
        setStreetName(result.street);
      }
      if (!districtTouchedRef.current && result.district) {
        setDistrict(normalizeDistrict(result.district));
      }
    });
  }, [activeMethod, routePoints, selectedCoords]);

  useEffect(() => {
    if (initialData) {
      const data = initialData;
      const projectId = data?.id;
      setExistingPictures([]);
      setRemovedPictureIds([]);

      const getString = (val: unknown): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        if (typeof val === 'object') {
          if (
            'value' in val &&
            (val as { value?: unknown }).value !== undefined
          ) {
            return getString((val as { value?: unknown }).value);
          }
          return '';
        }
        return '';
      };

      const mapStatusToEnum = (val: string): string => {
        const lower = val?.toLowerCase();
        if (lower === 'aktiv' || lower === 'active')
          return projectStatusEnum.ACTIVE;
        if (lower === 'archiv' || lower === 'archived')
          return projectStatusEnum.ARCHIVED;
        if (lower === 'geplant' || lower === 'planned')
          return projectStatusEnum.PLANNED;
        // fall back to original to avoid losing data if backend adds more
        return val;
      };

      const extractedTitle =
        getString(data.name) ||
        getString(data.title) ||
        getString(initialData.title) ||
        '';

      setTitle(extractedTitle);
      setDescriptionText(getString(data.description));
      const resolvedCategory =
        getString(data.category) || getString(data.category_id);
      setCategory(resolvedCategory);
      setStatus(mapStatusToEnum(getString(data.status)));
      setCost(getString(data.cost));
      setDistrict(normalizeDistrict(getString(data.district)));
      setStreetName(getString(data.street_name || data.street));
      setContactPerson(getString(data.contact_person || data.contact));

      const publicVal =
        data.is_public !== undefined
          ? data.is_public
          : data.public !== undefined
            ? data.public
            : data.isPublic;
      setIsPublic(Boolean(publicVal));

      const normalizeDate = (val: unknown): string => {
        const raw = getString(val);
        if (!raw) return '';
        // If it's ISO, take date part; if already YYYY-MM-DD keep as is.
        const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
        if (isoMatch) return isoMatch[1];
        return raw;
      };

      setStartDate(normalizeDate(data.start_date || data.startDate));
      setEndDate(normalizeDate(data.end_date || data.endDate));

      // Handle coordinates if available
      if (data.location && data.location.coordinates) {
        // GeoJSON Point: [lng, lat]
        const [lng, lat] = data.location.coordinates;
        setSelectedCoords({ lat, lng });
        setPositionSet(true);
        setActiveMethod('map');
      } else if (initialData.position) {
        // If it's the Marker object from MapModal, it has position: [lat, lng]
        const [lat, lng] = initialData.position;
        setSelectedCoords({ lat, lng });
        setPositionSet(true);
        setActiveMethod('map');
      }

      // Fetch existing pictures when editing
      if (projectId) {
        getProjectPictures(auth.user?.access_token, String(projectId))
          .then((pics) => {
            if (Array.isArray(pics)) {
              const mapped = (pics as ProjectPictureData[])
                .map((p): { id: string; data: string } => ({
                  id: String(p.id ?? ''),
                  data: p.data ?? '',
                }))
                .filter((p): boolean => Boolean(p.data));
              setExistingPictures(mapped);
            }
          })
          .catch((err) => {
            console.error('Failed to load project pictures', err);
          });
      }

      // Force jump to step 2 with a small delay to ensure state is ready
      setTimeout(() => {
        setCurrentStep(2);
      }, 100);
    } else {
      resetState();
      setCurrentStep(1);
      setActiveMethod('address');
      setPositionSet(false);
    }
  }, [initialData]);

  // access the main map instance (MapCreatePinModal is rendered inside MapContainer)
  let map: LeafletMap | null = null;
  try {
    map = useMap();
  } catch (err) {
    // useMap will throw if this component isn't inside a MapContainer; swallow
    map = null;
  }
  // Control the centre-pin overlay visibility based on current step AND active method.
  // We call the parent visibility callback after a microtask to ensure the Map overlay
  // DOM has been mounted and the map can measure/attach the overlay correctly.
  useEffect(() => {
    if (!onRequestCenterPinVisibility) return;

    const shouldShow =
      currentStep === 1 && (activeMethod === 'map' || activeMethod === 'route');
    // schedule after render so Map/overlay elements exist
    const t = window.setTimeout(() => {
      try {
        onRequestCenterPinVisibility(shouldShow);
      } catch (e) {
        // ignore
      }
    }, 0);

    return () => {
      window.clearTimeout(t);
      try {
        onRequestCenterPinVisibility(false);
      } catch (e) {
        // ignore
      }
    };
  }, [activeMethod, currentStep, onRequestCenterPinVisibility]);

  const auth = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveHovered, setIsSaveHovered] = useState(false);

  const toLineLocation = (point: {
    lat: number;
    lng: number;
  }): {
    latitude: string;
    longitude: string;
  } => ({
    latitude: String(point.lat),
    longitude: String(point.lng),
  });

  const handleSave = async (): Promise<void> => {
    const missingRequired =
      !title.trim() ||
      !descriptionText.trim() ||
      !category.trim() ||
      !status.trim() ||
      !contactPerson.trim() ||
      !startDate.trim() ||
      !endDate.trim() ||
      !streetName.trim() ||
      !district.trim() ||
      !cost.trim();

    if (missingRequired) return;

    setIsSaving(true);
    try {
      const normalizedStatus = ((): string => {
        const lower = status?.toLowerCase();
        if (lower === 'aktiv' || lower === 'active')
          return projectStatusEnum.ACTIVE;
        if (lower === 'archiv' || lower === 'archived')
          return projectStatusEnum.ARCHIVED;
        if (lower === 'geplant' || lower === 'planned')
          return projectStatusEnum.PLANNED;
        return status;
      })();

      const firstRoutePoint = routePoints.length > 0 ? routePoints[0] : null;
      const existingLineLocations = initialData?.lineLocations;
      const existingLocation = initialData?.location;

      const project: NewProject = {
        title,
        description: descriptionText,
        category,
        status: normalizedStatus || projectStatusEnum.PLANNED,
        cost: cost ? parseFloat(cost) : null,
        district: district || null,
        street_name: streetName || null,
        location:
          activeMethod === 'route'
            ? firstRoutePoint
              ? {
                  latitude: String(firstRoutePoint.lat),
                  longitude: String(firstRoutePoint.lng),
                }
              : existingLocation || {}
            : selectedCoords
              ? {
                  latitude: String(selectedCoords.lat),
                  longitude: String(selectedCoords.lng),
                }
              : existingLocation || {},
        line_locations:
          activeMethod === 'route' && routePoints.length > 0
            ? routePoints.map(toLineLocation)
            : activeMethod !== 'route' && selectedCoords
              ? [
                  {
                    latitude: String(selectedCoords.lat),
                    longitude: String(selectedCoords.lng),
                  },
                ]
              : Array.isArray(existingLineLocations)
                ? existingLineLocations
                : undefined,
        contact_person: contactPerson,
        is_public: isPublic,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        tenantAbbreviation: tenantAbbreviation,
      };

      const projectId = initialData?.id;
      const isEdit = Boolean(projectId);

      let savedProject: Project | null = null;
      if (isEdit) {
        savedProject = await updateProject(
          auth.user?.access_token,
          String(projectId),
          project,
        );
      } else {
        savedProject = await createProject(auth.user?.access_token, project);
      }

      if (!isEdit) {
        try {
          onProjectCreated?.(savedProject || project);
        } catch (e) {
          console.warn('onProjectCreated callback error', e);
        }
      }

      // Upload/delete images if any (only when create/update succeeded and has id)
      const targetProjectId = isEdit ? String(projectId) : savedProject?.id;

      if (isEdit && targetProjectId && removedPictureIds.length > 0) {
        for (const picId of removedPictureIds) {
          try {
            await deleteProjectPicture(
              auth.user?.access_token,
              targetProjectId,
              picId,
            );
          } catch (deleteErr) {
            console.error(`Error deleting picture ${picId}:`, deleteErr);
          }
        }
      }

      if (targetProjectId && uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          try {
            await uploadProjectPicture(
              auth.user?.access_token,
              targetProjectId,
              file,
            );
          } catch (uploadErr) {
            console.error(`Error uploading file ${file.name}:`, uploadErr);
            // Continue uploading other files even if one fails
          }
        }
      }

      onCloseModal();
    } catch (err) {
      console.error('Error saving project:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed =
    activeMethod === 'address'
      ? selectedCoords !== null
      : positionSet || (activeMethod === 'route' && routePoints.length > 0);

  const isSaveDisabled =
    isSaving ||
    !title.trim() ||
    !descriptionText.trim() ||
    !category.trim() ||
    !status.trim() ||
    !contactPerson.trim() ||
    !startDate.trim() ||
    !endDate.trim() ||
    !streetName.trim() ||
    !district.trim() ||
    !cost.trim();

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    setUploadedFiles((prev) => {
      const combined = [...prev, ...newFiles];
      // remove duplicates by name+size
      const unique: File[] = combined.filter((f, idx, arr) => {
        return (
          arr.findIndex((x) => x.name === f.name && x.size === f.size) === idx
        );
      });
      return unique;
    });
    // reset input so same file can be selected again if removed
    e.currentTarget.value = '';
  };

  const handleRemoveFile = (index: number): void => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingPicture = (id: string): void => {
    setExistingPictures((prev) => prev.filter((p) => p.id !== id));
    setRemovedPictureIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const resetState = (): void => {
    setSearchQuery('');
    setSuggestions([]);
    setSelectedAddress('');
    setSelectedCoords(null);
    setPositionSet(false);
    setRoutePoints([]);
    setTitle('');
    setDescriptionText('');
    setCategory('');
    setStatus('');
    setCost('');
    setDistrict('');
    setStreetName('');
    setContactPerson('');
    setIsPublic(false);
    setStartDate('');
    setEndDate('');
    setExistingPictures([]);
    setRemovedPictureIds([]);
    try {
      onSelectCoordinates?.(null);
      onSelectRoute?.([]);
    } catch (e) {
      console.warn('resetState callbacks threw', e);
    }
  };

  return (
    <div
      className="top-16 rounded-lg shadow-xl p-0 overflow-hidden z-30 flex flex-col cursor-default font-sans"
      style={{
        ...menuStyle,
        ...getFilterModalStyle(),
        touchAction: 'auto',
        WebkitTapHighlightColor: 'transparent',
        backgroundColor: panelPrimaryColor,
        color: fontColor,
      }}
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onMouseDownCapture={handleMouseDownCapture}
      onDoubleClickCapture={handleDoubleClickCapture}
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between p-5 border-b border-gray-100">
        <div className="flex flex-row items-center">
          <FontAwesomeIcon icon={faMapPin} color={menuStyle?.color || '#FFF'} />
          <h2 className="text-lg font-bold ml-2">
            {initialData ? 'Pin bearbeiten' : 'Pin hinzufügen'}
          </h2>
        </div>
        <FontAwesomeIcon
          icon={faAnglesLeft}
          color={menuStyle?.color || '#FFF'}
          className="cursor-pointer hover:opacity-50 transition-colors"
          onClick={onCloseModal}
          onTouchStart={onCloseModal}
        />
      </div>

      {/* Content Scroll Area */}
      <div
        className="flex flex-col overflow-y-auto p-5 no-scrollbar"
        style={{ maxHeight: 'calc(100% - 60px)' }}
      >
        {' '}
        {/* STEP 1: Set Location */}
        {!isEdit && (
          <div>
            <div
              className="flex items-center gap-3 mb-3"
              onClick={(): void => setCurrentStep(1)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border"
                style={{
                  color: currentStep === 1 ? panelPrimaryColor : fontColor,
                  backgroundColor:
                    currentStep === 1 ? fontColor : 'transparent',
                  borderColor: fontColor,
                }}
              >
                1
              </div>
              <h3 className="font-bold text-lg">Standort bestimmen</h3>
            </div>

            {currentStep === 1 && (
              <div className="pl-11 border-l-2 border-gray-100 ml-4 pb-6">
                <div className="space-y-4">
                  {/* Method A: Adress Input */}
                  <div className="rounded-lg border border-gray-200 transition-all duration-200 overflow-hidden">
                    <button
                      onClick={() => {
                        if (activeMethod !== 'address') resetState();
                        setActiveMethod('address');
                      }}
                      className="w-full text-left px-4 py-3 font-semibold text-sm focus:outline-none"
                      style={{
                        fontWeight:
                          activeMethod === 'address' ? 'bold' : 'normal',
                      }}
                    >
                      Adresseingabe
                    </button>

                    {activeMethod === 'address' && (
                      <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Adresse suchen (z.B. Musterstraße 1, Stadt)"
                              value={searchQuery}
                              onChange={(e): void => {
                                const v = e.target.value;
                                setSearchQuery(v);
                                // debounce live search
                                if (searchTimer.current) {
                                  window.clearTimeout(searchTimer.current);
                                }
                                // only search after user stopped typing for 300ms and query length >= 3
                                searchTimer.current = window.setTimeout(
                                  async () => {
                                    if (!v || v.trim().length < 3) {
                                      setSuggestions([]);
                                      return;
                                    }
                                    try {
                                      const token = env(
                                        'NEXT_PUBLIC_MAPBOX_TOKEN',
                                      );
                                      const q = encodeURIComponent(v);
                                      const res = await fetch(
                                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${token}&limit=5`,
                                      );
                                      const data = await res.json();
                                      setSuggestions(data.features || []);
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  },
                                  300,
                                ) as unknown as number;
                              }}
                              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                              style={{
                                color: fontColor,
                                backgroundColor: 'transparent',
                              }}
                            />
                          </div>

                          {suggestions.length > 0 && (
                            <ul
                              className="border rounded mt-2 max-h-40 overflow-auto text-sm"
                              style={{
                                backgroundColor: fontColor,
                                color: fontColor,
                              }}
                            >
                              {suggestions.map((s, idx) => (
                                <li
                                  key={s.id || idx}
                                  className="p-2 cursor-pointer"
                                  onClick={(): void => {
                                    const placeName = s.place_name || s.text;
                                    const center = s.center || [];
                                    setSelectedAddress(placeName || '');
                                    if (center && center.length >= 2) {
                                      setSelectedCoords({
                                        lat: center[1]!,
                                        lng: center[0]!,
                                      });
                                      setPositionSet(true);
                                      // notify parent (map) so it can center/jump to the selection
                                      try {
                                        onSelectCoordinates?.({
                                          lat: center[1]!,
                                          lng: center[0]!,
                                          label: placeName,
                                        });
                                      } catch (err) {
                                        console.warn(
                                          'onSelectCoordinates handler threw',
                                          err,
                                        );
                                      }
                                    }
                                    setSuggestions([]);
                                    setSearchQuery(placeName || '');
                                  }}
                                >
                                  {s.place_name}
                                </li>
                              ))}
                            </ul>
                          )}

                          {selectedAddress && (
                            <div className="text-sm">{selectedAddress}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Method B: Map Dragger */}
                  <div className="rounded-lg border border-gray-200 transition-all duration-200 overflow-hidden">
                    <button
                      onClick={() => {
                        if (activeMethod !== 'map') resetState();
                        setActiveMethod('map');
                      }}
                      className="w-full text-left px-4 py-3 font-semibold text-sm focus:outline-none"
                      style={{
                        fontWeight: activeMethod === 'map' ? 'bold' : 'normal',
                      }}
                    >
                      Standort über Karte bestimmen
                    </button>

                    {activeMethod === 'map' && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        {/* Dragger Controls */}
                        <div className="w-full p-3 pt-0">
                          <button
                            type="button"
                            onClick={(): void => {
                              try {
                                const c = map?.getCenter?.();
                                if (c) {
                                  const centre = { lat: c.lat, lng: c.lng };
                                  setSelectedCoords(centre);
                                  setPositionSet(true);
                                  // clear any previous address search value when using the dragger
                                  setSelectedAddress('');
                                  setSearchQuery('');
                                  setSuggestions([]);
                                  // notify parent to add the grey pin, but keep modal open
                                  onSelectCoordinates?.({
                                    lat: centre.lat,
                                    lng: centre.lng,
                                  });
                                }
                              } catch (err) {
                                console.warn(
                                  'onSelectCoordinates handler threw',
                                  err,
                                );
                              }
                            }}
                            className="w-full font-semibold text-sm py-2 rounded"
                            style={{
                              backgroundColor: headerSecondaryColor,
                              color: fontColor,
                            }}
                          >
                            Position übernehmen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Method C: Route Creator */}
                  <div className="rounded-lg border border-gray-200 transition-all duration-200 overflow-hidden">
                    <button
                      onClick={() => {
                        if (activeMethod !== 'route') resetState();
                        setActiveMethod('route');
                      }}
                      className="w-full text-left px-4 py-3 font-semibold text-sm focus:outline-none"
                      style={{
                        fontWeight:
                          activeMethod === 'route' ? 'bold' : 'normal',
                      }}
                    >
                      Strecke über Standort bestimmen
                    </button>

                    {activeMethod === 'route' && (
                      <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="w-full p-3 pt-0 space-y-2">
                          <div className="text-sm">
                            Punkte: {routePoints.length}
                          </div>
                          <button
                            type="button"
                            onClick={(): void => {
                              try {
                                const c = map?.getCenter?.();
                                if (c) {
                                  const pt = { lat: c.lat, lng: c.lng };
                                  setRoutePoints((prev) => {
                                    const next = [...prev, pt];
                                    // inform parent so the map can render the live polyline
                                    try {
                                      onSelectRoute?.(next);
                                    } catch (e) {
                                      console.warn(
                                        'onSelectRoute update threw',
                                        e,
                                      );
                                    }
                                    return next;
                                  });
                                  // keep the centre pin visible while drawing
                                  setPositionSet(true);
                                }
                              } catch (err) {
                                console.warn('add route point threw', err);
                              }
                            }}
                            className="w-full font-semibold text-sm py-2 rounded"
                            style={{
                              backgroundColor: fontColor,
                              color: menuPrimaryColor,
                            }}
                          >
                            Punkt hinzufügen
                          </button>

                          <button
                            type="button"
                            disabled={routePoints.length === 0}
                            onClick={(): void => {
                              try {
                                setRoutePoints((prev) => {
                                  if (!prev || prev.length === 0) return prev;
                                  const next = prev.slice(0, -1);
                                  try {
                                    onSelectRoute?.(next);
                                  } catch (e) {
                                    console.warn('onSelectRoute undo threw', e);
                                  }
                                  setPositionSet(next.length > 0);
                                  return next;
                                });
                              } catch (err) {
                                console.warn('undo route point threw', err);
                              }
                            }}
                            className={`w-full font-semibold text-sm py-2 rounded mt-2 ${routePoints.length === 0 ? 'cursor-not-allowed' : ''}`}
                            style={{
                              backgroundColor: fontColor,
                              color: menuPrimaryColor,
                              opacity: routePoints.length === 0 ? 0.5 : 1,
                            }}
                          >
                            Letzten Punkt entfernen
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-8">
                  <button
                    onClick={onCloseModal}
                    className="flex-1 font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-colors"
                    style={{
                      backgroundColor:
                        effectiveCiColors?.cancelButtonColor || secondaryColor,
                      color: effectiveCiColors?.fontColor || '#FFFFFF',
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    className={`flex-1 font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-colors ${
                      canProceed ? 'hover:opacity-90' : 'cursor-not-allowed'
                    }`}
                    style={
                      canProceed
                        ? {
                            backgroundColor:
                              effectiveCiColors?.saveButtonColor || '#16A34A',
                            color: fontColor,
                          }
                        : {
                            backgroundColor: fontColor,
                            color: menuPrimaryColor,
                            opacity: 0.5,
                          }
                    }
                    onClick={(): void => {
                      try {
                        if (activeMethod === 'address') {
                          // Address selection should already have set selectedCoords via suggestion click
                          setCurrentStep(2);
                          try {
                            onRequestCenterPinVisibility?.(false);
                          } catch (e) {}
                          return;
                        }

                        if (activeMethod === 'map') {
                          /* If the user already confirmed a position via "Position übernehmen",
                         don't override it by reading the live centre. Only capture centre if
                         no confirmed position exists (positionSet === false). */
                          try {
                            if (positionSet && selectedCoords) {
                              // use previously confirmed coords
                              try {
                                onSelectCoordinates?.({
                                  lat: selectedCoords.lat,
                                  lng: selectedCoords.lng,
                                });
                              } catch (e) {
                                console.warn(
                                  'onSelectCoordinates on proceed threw',
                                  e,
                                );
                              }
                            } else {
                              const c = map?.getCenter?.();
                              if (c) {
                                const centre = { lat: c.lat, lng: c.lng };
                                setSelectedCoords(centre);
                                setPositionSet(true);
                                setSelectedAddress('');
                                setSearchQuery('');
                                setSuggestions([]);
                                onSelectCoordinates?.({
                                  lat: centre.lat,
                                  lng: centre.lng,
                                });
                              }
                            }
                          } catch (e) {
                            console.warn(
                              'capturing center on proceed threw',
                              e,
                            );
                          }
                          setCurrentStep(2);
                          try {
                            onRequestCenterPinVisibility?.(false);
                          } catch (e) {}
                          return;
                        }

                        if (activeMethod === 'route') {
                          if (routePoints && routePoints.length > 0) {
                            try {
                              onSelectRoute?.(routePoints);
                            } catch (e) {
                              console.warn('onSelectRoute on proceed threw', e);
                            }
                            setSelectedAddress('');
                            setSearchQuery('');
                            setSuggestions([]);
                            setPositionSet(true);
                            setCurrentStep(2);
                            try {
                              onRequestCenterPinVisibility?.(false);
                            } catch (e) {}
                          }
                          return;
                        }
                      } catch (err) {
                        console.warn('Proceed handler threw', err);
                      }
                    }}
                    disabled={!canProceed}
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        {/* STEP 2: Pin Data */}
        <div>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border"
              style={{
                color: currentStep === 2 ? panelPrimaryColor : fontColor,
                backgroundColor: currentStep === 2 ? fontColor : 'transparent',
                borderColor: fontColor,
              }}
            >
              2
            </div>
            <h3 className="font-bold text-lg">Pin beschreiben</h3>
          </div>

          {currentStep === 2 && (
            <div className="pl-11 border-l-2 border-gray-100 ml-4 pb-6 mt-4">
              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm mb-2">Titel</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titel eingeben"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm mb-2">
                  Beschreibung (max. {MAX_DESCRIPTION_LENGTH} Zeichen)*
                </label>
                <textarea
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value)}
                  placeholder="Beschreiben Sie bitte den Pin..."
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  rows={4}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                />
                <div className="text-xs mt-2">
                  {descriptionText.length}/{MAX_DESCRIPTION_LENGTH}
                </div>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm mb-2">Kategorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                >
                  <option value="">Bitte wählen...</option>
                  {Object.values(projectCategoryEnum).map((val) => (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                >
                  <option value="">Bitte wählen...</option>
                  {projectStatusOptions
                    .filter((opt) => opt.value)
                    .map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                </select>
              </div>

              {/* Cost */}
              <div className="mb-4">
                <label className="block text-sm mb-2">Kosten</label>
                <input
                  type="text"
                  value={cost}
                  inputMode="decimal"
                  pattern="[0-9,]*"
                  onChange={(e) => {
                    const raw = e.target.value;
                    const sanitized = raw.replace(/[^0-9,]/g, '');
                    const parts = sanitized.split(',');
                    const normalized =
                      parts.length > 2
                        ? `${parts[0]},${parts.slice(1).join('')}`
                        : sanitized;
                    setCost(normalized);
                  }}
                  placeholder="Kosten"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                />
              </div>

              {/* District */}
              <div className="mb-4">
                <label className="block text-sm mb-2">Stadtteil / Bezirk</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => {
                    const next = e.target.value;
                    setDistrict(next);
                    districtTouchedRef.current = next.trim().length > 0;
                  }}
                  placeholder="Stadtteil"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                />
              </div>

              {/* Streetname */}
              <div className="mb-4">
                <label className="block text-sm mb-2">Straßenname</label>
                <input
                  type="text"
                  value={streetName}
                  onChange={(e) => {
                    const next = e.target.value;
                    setStreetName(next);
                    streetNameTouchedRef.current = next.trim().length > 0;
                  }}
                  placeholder="Straße"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                />
              </div>

              {/* Contact Person */}
              <div className="mb-4">
                <label className="block text-sm mb-2">Ansprechpartner</label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="Name"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  style={{
                    color: fontColor,
                    backgroundColor: 'transparent',
                  }}
                />
              </div>

              {/* Is Public */}
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm">
                  Öffentlich sichtbar
                </label>
              </div>

              {/* Dates */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className="block text-sm mb-2">Startdatum</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    style={{
                      color: fontColor,
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm mb-2">Enddatum</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    style={{
                      color: fontColor,
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
              </div>

              {/* Image upload */}
              <div className="mb-4">
                {existingPictures.length > 0 && (
                  <div className="mb-3">
                    <label className="block text-sm mb-2">
                      Vorhandene Bilder
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {existingPictures.map((p) => (
                        <div
                          key={p.id}
                          className="relative group aspect-square rounded overflow-hidden border border-gray-300"
                          style={{ backgroundColor: fontColor }}
                          onClick={(): void => {
                            setLightboxSrc(`data:image/jpeg;base64,${p.data}`);
                            setLightboxAlt(p.id);
                          }}
                        >
                          <img
                            src={`data:image/jpeg;base64,${p.data}`}
                            alt={p.id}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(event): void => {
                              event.stopPropagation();
                              handleRemoveExistingPicture(p.id);
                            }}
                            className="absolute top-1 right-1 rounded-full p-1.5 w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            style={{
                              backgroundColor: fontColor,
                              color: menuPrimaryColor,
                            }}
                            title="Entfernen"
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label className="block text-sm mb-2">
                  Bild(er) hochladen (optional, je Bild max.10MB):
                </label>
                <label
                  className="inline-block w-full text-center border border-blue-300 rounded px-4 py-2 cursor-pointer transition-colors"
                  style={{
                    backgroundColor: fontColor,
                    color: menuPrimaryColor,
                  }}
                >
                  Bilder auswählen
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesChange}
                  />
                </label>
                <div className="mt-2">
                  {uploadedFiles.length === 0 ? (
                    <div className="text-xs">Keine Datei ausgewählt</div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {uploadedFiles.map((f, i) => (
                        <div
                          key={`${f.name}-${f.size}`}
                          className="relative group aspect-square rounded overflow-hidden border border-gray-300"
                          style={{ backgroundColor: fontColor }}
                          onClick={(): void => {
                            setLightboxSrc(URL.createObjectURL(f));
                            setLightboxAlt(f.name);
                          }}
                        >
                          <img
                            src={URL.createObjectURL(f)}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={(event): void => {
                              event.stopPropagation();
                              handleRemoveFile(i);
                            }}
                            className="absolute top-1 right-1 rounded-full p-1.5 w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                            style={{
                              backgroundColor: fontColor,
                              color: menuPrimaryColor,
                            }}
                            title="Entfernen"
                          >
                            <FontAwesomeIcon icon={faTrash} size="sm" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 action buttons */}
              <div className="flex items-center gap-3 mt-4">
                {!isEdit && (
                  <button
                    className="flex-1 font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-colors"
                    style={{
                      backgroundColor:
                        effectiveCiColors?.cancelButtonColor || secondaryColor,
                      color: fontColor,
                    }}
                    onClick={(): void => {
                      setCurrentStep(1);
                      try {
                        onRequestCenterPinVisibility?.(
                          activeMethod === 'map' || activeMethod === 'route',
                        );
                      } catch (e) {}
                    }}
                  >
                    Zurück
                  </button>
                )}
                <button
                  className={`flex-1 font-bold py-2 px-4 rounded text-xs uppercase tracking-wider transition-colors ${isSaveDisabled ? 'cursor-not-allowed' : ''}`}
                  style={
                    isSaveDisabled
                      ? {
                          backgroundColor: '#9CA3AF',
                          color: fontColor,
                          opacity: 0.7,
                        }
                      : {
                          backgroundColor: isSaveHovered
                            ? effectiveCiColors?.saveHoverButtonColor ||
                              '#059669'
                            : effectiveCiColors?.saveButtonColor || '#16A34A',
                          color: fontColor,
                        }
                  }
                  onMouseEnter={(): void => setIsSaveHovered(true)}
                  onMouseLeave={(): void => setIsSaveHovered(false)}
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                >
                  {isSaving ? 'Speichert...' : 'Speichern'}
                </button>
              </div>
              <div
                className="mt-2 text-xs"
                style={{ color: fontColor, opacity: 0.8 }}
              >
                Das Anzeigen von neuen Projekten oder Änderungen kann bis zu 10
                Minuten dauern
              </div>
            </div>
          )}
        </div>
      </div>
      <ImageLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        buttonTextColor={menuPrimaryColor}
        onClose={(): void => {
          if (lightboxSrc?.startsWith('blob:')) {
            URL.revokeObjectURL(lightboxSrc);
          }
          setLightboxSrc(null);
        }}
      />
    </div>
  );
}
