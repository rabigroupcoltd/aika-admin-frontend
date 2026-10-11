export interface PlatformSetting {
  key: string;
  label?: string;
  value: number;
  min?: number;
  description: string;
  updatedAt: string | null;
}

export interface UpdatePlatformSettingVariables {
  key: string;
  value: number;
}
