export type SCIMErrorResource = {
  status: number;
  detail?: string;
  schemas: string[];
};

export class SCIMError {
  resource: SCIMErrorResource = {
    status: 404,
    detail: "Error",
    schemas: ["urn:ietf:params:scim:api:messages:2.0:Error"],
  } as SCIMErrorResource;

  constructor(status: number, detail?: string) {
    this.resource.status = status;
    this.resource.detail = detail;
  }

  public getResource = () => {
    return this.resource;
  };
}
