import axios from "axios";
import { PatientLoader } from "./patient-loader";

/**
 * Implementation of the PatientLoader that calls the Metriport API
 * to execute each its functions.
 */
export class PatientLoaderMetriportAPI extends PatientLoader {
  constructor(private readonly apiUrl: string) {
    super();
  }

  public async getStatesFromPatientIds(cxId: string, patientIds: string[]): Promise<string[]> {
    const resp = await axios.post(`${this.apiUrl}/internal/patient/states`, {
      cxId,
      patientIds,
    });
    return resp.data.states;
  }
}