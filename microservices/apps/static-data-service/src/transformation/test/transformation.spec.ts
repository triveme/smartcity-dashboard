import { TransformationService } from '../transformation.service';
import { Test } from '@nestjs/testing';
import {
  getMultipleFeatureCollections,
  getSingleFeatureCollection,
} from './test-data';

describe('TransformationService', () => {
  let transformationService: TransformationService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [TransformationService],
    }).compile();

    transformationService = moduleRef.get<TransformationService>(
      TransformationService,
    );
  });

  describe('convert feature collection', () => {
    it('should transform multiple feature collections', () => {
      const featureCollections = getMultipleFeatureCollections();
      const ngsiData =
        transformationService.transformToNgsi(featureCollections);

      expect(ngsiData).toHaveLength(6);

      for (let index = 0; index < ngsiData.length; index++) {
        const feature = ngsiData[index];

        expect(feature.id).toContain(`Feature`);
        expect(feature.type).toEqual('GeoFeature');
        expect(feature.location).not.toBeNull();
      }
    });

    it('should transform single feature collection', () => {
      const featureCollections = getSingleFeatureCollection();
      const ngsiData =
        transformationService.transformToNgsi(featureCollections);

      expect(ngsiData).toHaveLength(3);

      for (let index = 0; index < ngsiData.length; index++) {
        const feature = ngsiData[index];
        const id = index + 1;

        expect(feature.id).toEqual(`Feature${id}`);
        expect(feature.type).toEqual('GeoFeature');
        expect(feature.location).not.toBeNull();
      }
    });

    it('should return empty array for null feature collection', async () => {
      const ngsiData = transformationService.transformToNgsi(null);

      expect(ngsiData).toHaveLength(0);
    });

    it('should return empty array for empty feature collection', async () => {
      const ngsiData = transformationService.transformToNgsi([]);

      expect(ngsiData).toHaveLength(0);
    });
  });
});
