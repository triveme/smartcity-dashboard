'use client';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { getProject, getProjectPictures } from '@/api/project-service';
import ImageLightbox from '@/ui/ImageLightbox';
import { projectStatusOptions } from '@/utils/enumMapper';

const formatDate = (value?: string): string => {
  if (!value) return '';
  const datePart = value.split('T')[0];
  const isoDateMatch = /^\d{4}-\d{2}-\d{2}$/.exec(datePart);
  let date: Date;
  if (isoDateMatch) {
    const [year, month, day] = datePart.split('-').map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('de-DE').format(date);
};

const formatDateRange = (start?: string, end?: string): string => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s} - ${e}`;
  return s || e || '';
};

const getValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (
      'value' in value &&
      (value as { value?: unknown }).value !== undefined
    ) {
      return getValue((value as { value?: unknown }).value);
    }
  }
  return '';
};

const mapProjectStatusLabel = (value: string): string => {
  const match = projectStatusOptions.find((option) => option.value === value);
  return match?.label || value;
};

const formatCost = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  }
  if (typeof value === 'string') {
    const normalized = value.replace(/\./g, '').replace(',', '.');
    const asNumber = Number(normalized);
    if (!Number.isNaN(asNumber)) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
      }).format(asNumber);
    }
  }
  return getValue(value);
};

type ProjectPictureData = {
  id?: string | number;
  data?: string;
};

type ProjectInfoProps = {
  projectId?: string | number | null;
  className?: string;
  lightboxTextColor?: string;
};

type ProjectInfo = {
  title?: string;
  name?: string;
  start_date?: string;
  end_date?: string;
  district?: string;
  street_name?: string;
  status?: string;
  category_id?: string;
  category?: string;
  cost?: string | number;
  contact_person?: string;
  description?: string;
};

export default function ProjectInfoComponent(
  props: ProjectInfoProps,
): ReactElement {
  const { projectId, className, lightboxTextColor } = props;
  const auth = useAuth();
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [pictures, setPictures] = useState<{ id: string; data: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');

  useEffect(() => {
    let isActive = true;

    const load = async (): Promise<void> => {
      if (!projectId) {
        setProject(null);
        setPictures([]);
        return;
      }
      setIsLoading(true);
      try {
        const [proj, pics] = await Promise.all([
          getProject(auth.user?.access_token, String(projectId)),
          getProjectPictures(auth.user?.access_token, String(projectId)),
        ]);
        if (!isActive) return;
        setProject(proj || null);
        setPictures(
          Array.isArray(pics)
            ? (pics as ProjectPictureData[])
                .map((p) => ({ id: String(p.id ?? ''), data: p.data ?? '' }))
                .filter((p) => p.data)
            : [],
        );
      } catch (err) {
        if (!isActive) return;
        console.error('Failed to load project info', err);
        setProject(null);
        setPictures([]);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [auth.user?.access_token, projectId]);

  const dateRange = useMemo(() => {
    return formatDateRange(
      getValue(project?.start_date),
      getValue(project?.end_date),
    );
  }, [project]);

  if (!projectId) {
    return <div className={className} />;
  }

  if (isLoading) {
    return <div className={className}>Lade Projektdaten...</div>;
  }

  if (!project) {
    return <div className={className}>Keine Projektdaten vorhanden.</div>;
  }

  return (
    <div className={className}>
      <div className="flex flex-col gap-3">
        {dateRange && <div className="text-sm opacity-50">{dateRange}</div>}

        {getValue(project.district) && (
          <div className="text-sm">
            <span className="block font-semibold">Stadtteil</span>
            <span className="text-[1.2em]">{getValue(project.district)}</span>
          </div>
        )}
        {getValue(project.street_name) && (
          <div className="text-sm">
            <span className="block font-semibold">Straße</span>
            <span className="text-[1.2em]">
              {getValue(project.street_name)}
            </span>
          </div>
        )}
        {getValue(project.status) && (
          <div className="text-sm">
            <span className="block font-semibold">Status</span>
            <span className="text-[1.2em]">
              {mapProjectStatusLabel(getValue(project.status))}
            </span>
          </div>
        )}
        {(getValue(project.category) || getValue(project.category_id)) && (
          <div className="text-sm">
            <span className="block font-semibold">Kategorie</span>
            <span className="text-[1.2em]">
              {getValue(project.category) || getValue(project.category_id)}
            </span>
          </div>
        )}
        {getValue(project.cost) && (
          <div className="text-sm">
            <span className="block font-semibold">Baukosten</span>
            <span className="text-[1.2em]">{formatCost(project.cost)}</span>
          </div>
        )}
        {getValue(project.contact_person) && (
          <div className="text-sm">
            <span className="block font-semibold">Ansprechpartner</span>
            <span className="text-[1.2em]">
              {getValue(project.contact_person)}
            </span>
          </div>
        )}

        {pictures.length > 0 && (
          <div className="flex flex-col gap-3">
            {pictures.map((p) => (
              <div
                key={p.id}
                className="w-full rounded overflow-hidden border border-gray-300 cursor-pointer"
                onClick={(): void => {
                  setLightboxSrc(`data:image/jpeg;base64,${p.data}`);
                  setLightboxAlt(p.id);
                }}
              >
                <img
                  src={`data:image/jpeg;base64,${p.data}`}
                  alt={p.id}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {getValue(project.description) && (
          <div className="text-sm">
            <div className="font-semibold mb-1">Beschreibung:</div>
            <div className="whitespace-pre-wrap">
              {getValue(project.description)}
            </div>
          </div>
        )}
      </div>

      <ImageLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        buttonTextColor={lightboxTextColor}
        onClose={(): void => setLightboxSrc(null)}
      />
    </div>
  );
}
