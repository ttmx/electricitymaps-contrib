import useGetZone from 'api/getZone';
import { useCo2ColorScale } from 'hooks/theme';
import { useAtom } from 'jotai';
import { getCO2IntensityByMode } from 'utils/helpers';
import { productionConsumptionAtom } from 'utils/state/atoms';

import { getEmissionData, getPowerGenerationSources } from '../bar-breakdown/utils';
import { AreaGraphElement } from '../types';

export function useCarbonChartData() {
  const { data, isLoading, isError } = useGetZone();
  const co2ColorScale = useCo2ColorScale();
  const [mixMode] = useAtom(productionConsumptionAtom);

  if (isLoading || isError) {
    return { isLoading, isError };
  }

  const chartData: AreaGraphElement[] = Object.entries(data.zoneStates).map(
    ([datetimeString, value]) => {
      const datetime = new Date(datetimeString);
      const carbonIntensity =
        getCO2IntensityByMode(
          {
            c: { ci: value.co2intensity ?? 0 },
            p: { ci: value.co2intensityProduction ?? 0 },
          },
          mixMode
        ) ?? 0;

      return {
        datetime,
        layerData: {
          carbonIntensity,
        },
        meta: value,
      };
    }
  );

  const layerFill = (key: string) => (d: { data: AreaGraphElement }) => {
    if (d.data.layerData[key] === 0) {
      return co2ColorScale(Number.NaN);
    }
    return co2ColorScale(d.data.layerData[key]);
  };
  const result = {
    chartData,
    layerKeys: ['carbonIntensity'],
    layerFill,
  };

  const emissionSourceToProductionSource = getEmissionData(data);
  const powerGenerationSources = getPowerGenerationSources(data);

  return {
    data: result,
    emissionSourceToProductionSource,
    powerGenerationSources,
    isLoading,
    isError,
  };
}
