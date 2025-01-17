import { DataTypes, Sequelize } from "sequelize";
import { BaseModel, ModelSetup } from "./_default";
import { MrFilters } from "../domain/settings";

export const DATE_FORMAT = "YYYY-MM";
export const WEBHOOK_STATUS_OK = "OK";
export const WEBHOOK_STATUS_BAD_RESPONSE = "Bad response from webhook call";

export class Settings extends BaseModel<Settings> {
  static NAME = "settings";
  declare webhookUrl: string | null;
  declare webhookKey: string | null;
  declare webhookEnabled: boolean;
  declare webhookStatusDetail: string | null;
  declare mrFilters: MrFilters[] | null;

  static setup: ModelSetup = (sequelize: Sequelize) => {
    Settings.init(
      {
        ...BaseModel.attributes(),
        webhookUrl: {
          type: DataTypes.STRING,
        },
        webhookKey: {
          type: DataTypes.STRING,
        },
        webhookEnabled: {
          type: DataTypes.BOOLEAN,
        },
        webhookStatusDetail: {
          type: DataTypes.STRING,
        },
        mrFilters: {
          type: DataTypes.JSONB,
        },
      },
      {
        ...BaseModel.modelOptions(sequelize),
        tableName: Settings.NAME,
      }
    );
  };
}
