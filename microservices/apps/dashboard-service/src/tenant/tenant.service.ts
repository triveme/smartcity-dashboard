import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { NewTenant, Tenant } from '@app/postgres-db/schemas/tenant.schema';
import { Dashboard } from '@app/postgres-db/schemas';
import { TenantRepo } from './tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { LogoService } from '../logo/logo.service';
import { GeneralSettingsRepo } from '../general-settings/general-settings.repo';
import { v4 as uuid } from 'uuid';

export type TenantWithDashboards = Tenant & {
  dashboards: Dashboard[];
};

@Injectable()
export class TenantService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly tenantRepo: TenantRepo,
    private readonly corporateInfoService: CorporateInfoService,
    private readonly logoService: LogoService,
    private readonly generalSettingsRepo: GeneralSettingsRepo,
  ) {}

  private readonly logger = new Logger(TenantService.name);

  async getAll(): Promise<Tenant[]> {
    return this.tenantRepo.getAll();
  }

  async getById(id: string): Promise<Tenant> {
    return this.tenantRepo.getById(id);
  }

  async existsByAbbreviation(abbreviation: string): Promise<boolean> {
    return this.tenantRepo.existsByAbbreviation(abbreviation);
  }

  async create(row: NewTenant): Promise<Tenant> {
    return await this.db.transaction(async (tx) => {
      const result = await this.tenantRepo.create(row, tx);

      if (!result) {
        throw new HttpException(
          `Could not create tenant ${row.abbreviation}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.createCorporateInfo(result, tx, row, 'Light');
      await this.createCorporateInfo(result, tx, row, 'Dark');
      await this.createGeneralSettings(tx, row);

      return result;
    });
  }

  private async createCorporateInfo(
    result: Tenant,
    tx: DbType,
    row: NewTenant,
    theme: 'Dark' | 'Light',
  ): Promise<void> {
    const corporateInfo = await this.corporateInfoService.create(
      {
        tenantId: result.abbreviation,
        titleBar: theme,
        dashboardFontColor: '#FFF',
        dashboardPrimaryColor: '#2D3244',
        dashboardSecondaryColor: '#3D4760',
        fontColor: '#FFF',
        headerFontColor: '#FFF',
        headerLogoId: null,
        headerPrimaryColor: '#3d4760',
        headerSecondaryColor: '#3d4760',
        headerTitleAdmin: 'Smart Region Dashboard',
        headerTitleDashboards: 'Dashboards',
        logo: null,
        menuActiveColor: '#FFF',
        menuCornerColor: '#1d2330',
        menuCornerFontColor: '#fff',
        menuFontColor: '#fff',
        menuHoverColor: '#99a4c3ff',
        menuLogoId: null,
        menuPrimaryColor: '#3D4760',
        menuSecondaryColor: '#1d2330',
        panelBorderColor: '#3D4760',
        panelBorderRadius: '4px',
        panelBorderSize: '4px',
        panelFontColor: '#FFF',
        panelPrimaryColor: '#3D4760',
        panelSecondaryColor: '#3D4760',
        showHeaderLogo: true,
        showMenuLogo: true,
        widgetBorderColor: '#3D4760',
        widgetBorderRadius: '4px',
        widgetBorderSize: '4px',
        widgetFontColor: '#FFF',
        widgetPrimaryColor: '#3D4760',
        widgetSecondaryColor: '#3D4760',
        scrollbarBackground: '#b9c2ee',
        scrollbarColor: '#3D4760',
        menuActiveFontColor: '#1d2330',
        useColorTransitionHeader: false,
        useColorTransitionMenu: false,
        saveButtonColor: '#f5c442',
        saveHoverButtonColor: '#f7c543',
        cancelButtonColor: '#803535ff',
        cancelHoverButtonColor: '#ffffffff',
        fontFamily: 'Arial',
        barChartAxisLabelSize: '14',
        barChartAxisLineColor: '#ffffffff',
        barChartAxisTicksFontSize: '14',
        barChartCurrentValuesColors: [
          '#FFA500',
          '#FF4500',
          '#00FF00',
          '#6f3939ff',
          '#d61010ff',
          '#a28d8dff',
          '#618369ff',
          '#7e6969ff',
          '#3d2f2fff',
          '#ecddddff',
        ],
        barChartGridColor: '#ffffffff',
        barChartLegendFontSize: '14',
        barChartTicksFontColor: '#ffffffff',
        coloredSliderArrowColor: null,
        coloredSliderBigValueFontColor: null,
        coloredSliderBigValueFontSize: null,
        coloredSliderLabelFontColor: null,
        coloredSliderLabelFontSize: null,
        coloredSliderUnitFontSize: null,
        dashboardHeadlineFontSize: '24px',
        degreeChart180BgColor: '#190f50ff',
        degreeChart180FillColor: '#ffffffff',
        degreeChart180FontColor: '#ffffffff',
        degreeChart180FontSize: '20',
        degreeChart180UnitFontSize: '15',
        degreeChart360BgColor: '#004cafff',
        degreeChart360FillColor: '#ffffffff',
        degreeChart360FontColor: '#ffffffff',
        degreeChart360FontSize: '20',
        degreeChart360UnitFontSize: '15',
        iconWithLinkFontColor: '#ffffffff',
        iconWithLinkFontSize: '20',
        iconWithLinkIconColor: '#ffffffff',
        iconWithLinkIconSize: 'xl',
        informationTextFontColor: '#ffffffff',
        informationTextFontSize: '20',
        lineChartAxisLabelFontColor: '#ffffffff',
        lineChartAxisLabelSize: '14',
        lineChartAxisLineColor: '#ffffffff',
        lineChartAxisTicksFontSize: '14',
        lineChartCurrentValuesColors: [
          '#4f94dbff',
          '#755b5bff',
          '#971b1bff',
          '#31586fff',
          '#4bc771ff',
          '#b9c58bff',
          '#2534afb2',
          '#b21dc2ff',
          '#b1a2a2ff',
          '#ce3388ff',
        ],
        lineChartGridColor: '#ffffffff',
        lineChartLegendFontSize: '14',
        lineChartLegendFontColor: '#ffffffff',
        lineChartTicksFontColor: '#ffffffff',
        measurementChartAxisLabelFontColor: '#4f94dbff',
        measurementChartAxisLineColor: '#755b5bff',
        measurementChartAxisTicksFontColor: '#971b1bff',
        measurementChartBarColor: '#31586fff',
        measurementChartBigValueFontColor: '#4bc771ff',
        measurementChartBigValueFontSize: '60',
        measurementChartCardsBgColor: '#ffffff00',
        measurementChartCardsFontColor: '#ffffffff',
        measurementChartCardsIconColors: [
          '#68aff0ff',
          '#dd4bc0ff',
          '#d88935ff',
          '#e71010ff',
        ],
        measurementChartCurrentValuesColors: ['#00c8ffff'],
        measurementChartGridColor: '#ffffffff',
        measurementChartLabelFontColor: '#ffffff00',
        measurementChartTopButtonBgColor: '#ffffffff',
        measurementChartTopButtonFontColor: '#ffffff00',
        measurementChartTopButtonHoverColor: '#000152ff',
        measurementChartTopButtonInactiveBgColor: '#ffffff00',
        panelHeadlineFontSize: '24px',
        pieChartFontColor: '#ffffffff',
        pieChartFontSize: '20',
        pieChartCurrentValuesColors: [
          '#4f94dbff',
          '#755b5bff',
          '#971b1bff',
          '#31586fff',
          '#4bc771ff',
          '#b9c58bff',
          '#2534afb2',
          '#b21dc2ff',
          '#b1a2a2ff',
          '#ce3388ff',
        ],
        sliderCurrentFontColor: '#000000',
        sliderMaximumFontColor: '#FFFFFF',
        sliderGeneralFontColor: '#FFFFFF',
        sliderCurrentColor: '#DC2626',
        sliderMaximumColor: '#000000',
        stageableChartFontColor: '#ffffffff',
        stageableChartFontSize: '20',
        stageableChartTicksFontColor: '#ffffffff',
        stageableChartTicksFontSize: '10',
        wertFontColor: '#ffffffff',
        widgetHeadlineFontSize: '20',
        widgetSubheadlineFontSize: '16px',
        wertFontSize: '14px',
        wertUnitFontSize: '20',
        barChartAxisLabelColor: '#ffffffff',
        barChartLegendFontColor: '#FFFFFF',
        barChartFilterColor: '#F1B434',
        barChartFilterTextColor: '#1D2330',
        lineChartFilterColor: '#F1B434',
        lineChartFilterTextColor: '#1D2330',
        barChartAxisLabelFontColor: '#FFFFF',
      },
      tx,
    );

    if (!corporateInfo) {
      throw new HttpException(
        `Could not create corporate identity for tenant ${row.abbreviation} with theme ${theme}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async delete(id: string): Promise<Tenant> {
    return this.db.transaction(async (tx) => {
      const dbTenant = await this.tenantRepo.getById(id);

      if (!dbTenant)
        throw new NotFoundException(`Tenant not found by id ${id}`);

      await this.corporateInfoService.deleteByTenant(dbTenant.abbreviation, tx);
      await this.logoService.deleteByTenant(dbTenant.abbreviation, tx);

      return await this.tenantRepo.delete(id);
    });
  }

  async getTenantByAbbreviation(abbreviation: string): Promise<Tenant> {
    const tenantByAbbreviation =
      await this.tenantRepo.getTenantByAbbreviation(abbreviation);

    if (!tenantByAbbreviation) {
      throw new HttpException(
        'No tenant found with given abbreviation.',
        HttpStatus.NOT_FOUND,
      );
    }

    return tenantByAbbreviation;
  }

  async getTenantsWithDashboards(): Promise<TenantWithDashboards[]> {
    // Joining the related tenant & dashboard tables
    const flatTenantData = await this.tenantRepo.getFlatTenantData();

    if (flatTenantData.length === 0) {
      this.logger.error('No tenants found.');
      throw new HttpException('Tenants Not Found', HttpStatus.NOT_FOUND);
    } else {
      // constructing the TenantWithDashboards returnable
      return this.reduceRowsToTenantWithDashboards(flatTenantData);
    }
  }

  async getTenantWithDashboards(id: string): Promise<TenantWithDashboards> {
    // Joining the related tenant & dashboard tables
    const flatTenantData = await this.tenantRepo.getFlatTenantData();

    if (flatTenantData.length === 0) {
      this.logger.error(`No tenant found by id ${id}`);
      throw new HttpException('Tenants Not Found', HttpStatus.NOT_FOUND);
    } else {
      const tenantsWithDashboards =
        this.reduceRowsToTenantWithDashboards(flatTenantData);

      return tenantsWithDashboards[0];
    }
  }

  // Method to construct the Tenant objects with an array of dashboards inside
  private reduceRowsToTenantWithDashboards(rows): TenantWithDashboards[] {
    const tenantsWithDashboards: Record<string, TenantWithDashboards> = {};

    rows.forEach((row) => {
      const tenantId = row.tenant.id as string;
      const dashboardId = row.dashboard?.id as string | null;

      if (!tenantsWithDashboards[tenantId]) {
        tenantsWithDashboards[tenantId] = {
          ...row.tenant,
          dashboards: [],
        };
      }

      if (dashboardId) {
        tenantsWithDashboards[tenantId].dashboards.push(
          row.dashboard as Dashboard,
        );
      }
    });

    return Object.values(tenantsWithDashboards);
  }

  private async createGeneralSettings(
    tx: DbType,
    tenant: NewTenant,
  ): Promise<void> {
    await this.generalSettingsRepo.create(
      {
        id: uuid(),
        tenant: tenant.abbreviation,
        information: null,
        imprint: null,
        privacy: null,
        allowThemeSwitching: false,
        disclaimer: null,
      },
      tx,
    );
  }
}
