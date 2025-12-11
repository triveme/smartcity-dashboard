import axios from 'axios';

const NEXT_PUBLIC_USI_PLATFORM_SERVICE_URL =
  process.env.NEXT_PUBLIC_USI_PLATFORM_SERVICE_URL;

export type UsiEventType = {
  name: string;
  sensors: string[];
  attributes: string[];
};

export async function getEventtypes(
  args: string | undefined,
): Promise<UsiEventType[]> {
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_USI_PLATFORM_SERVICE_URL}/usi-platform/event-types`,
      {
        params: {
          apiid: args,
        },
      },
    );
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
