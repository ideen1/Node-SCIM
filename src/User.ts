import { PatchRequest } from "./Patch.js";
import { SCIMError } from "./SCIMError.js";
import { ListResource } from "./ListResource.js";
import {
  ListFilter,
  Resource,
  ResourceActions,
  ResourceDBCallBackType,
} from "./Resource.js";

export type SCIMUserResource = {
  schemas: string[];
  externalId: string;
  id: string;
  userName: string;
  active: boolean;
  emails: Email[];
  meta: Meta;
  name: Name;
  roles: Role[];
};

export type SCIMUserPublic = {
  userName: string;
  email: string;
  givenName: string;
  familyName: string;
  title: string;
  id: string;
  externalId: string;
  role: string;
};

export interface Email {
  primary: boolean;
  type: string;
  value: string;
}

export interface Role {
  primary: boolean;
  type: string;
  value: string;
}

export interface Meta {
  resourceType: string;
}

export interface Name {
  formatted: string;
  familyName: string;
  givenName: string;
}

export class User extends Resource implements ResourceActions {
  private dbHandlerNotRegistered = (event: Partial<SCIMUserResource>) => {
    throw new Error(`Handler not registered`);
  };

  resource: SCIMUserResource = {} as SCIMUserResource;

  private registeredDatabaseHandlers: {
    [ResourceDBCallBackType.Create]: (
      resource: SCIMUserPublic
    ) => Promise<SCIMUserPublic>;
    [ResourceDBCallBackType.List]: (
      query: ListFilter
    ) => Promise<SCIMUserPublic[]>;
    [ResourceDBCallBackType.Update]: (
      resource: PatchRequest,
      resourceId: string
    ) => Promise<SCIMUserPublic>;
    [ResourceDBCallBackType.Delete]: (resourceId: string) => Promise<void>;
    [ResourceDBCallBackType.Get]: (
      resourceId: string
    ) => Promise<SCIMUserPublic>;
  } = {
    Create: () => {
      throw new Error(`Handler not registered`);
    },
    List: () => {
      throw new Error(`Handler not registered`);
    },
    Update: () => {
      throw new Error(`Handler not registered`);
    },
    Delete: () => {
      throw new Error(`Handler not registered`);
    },
    Get: () => {
      throw new Error(`Handler not registered`);
    },
  };

  private resourceToPublic = (resource: SCIMUserResource): SCIMUserPublic => {
    return {
      userName: resource?.userName ?? undefined,
      email: resource?.emails?.[0]?.value ?? undefined,
      givenName: resource?.name.givenName ?? undefined,
      familyName: resource?.name.familyName ?? undefined,
      title: "" ?? undefined,
      id: resource?.id ?? undefined,
      externalId: resource?.externalId ?? undefined,
      role: resource?.roles?.[0].value ?? undefined,
    };
  };

  private publicToResource = (
    publicResource: SCIMUserPublic
  ): SCIMUserResource => {
    return {
      schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
      externalId: publicResource.externalId,
      id: publicResource.id,
      userName: publicResource.userName,
      active: true,
      emails: [{ value: publicResource.email, primary: true, type: "work" }],
      meta: {
        resourceType: "User",
      },
      name: {
        formatted: `${publicResource.givenName} ${publicResource.familyName}`,
        familyName: publicResource.familyName,
        givenName: publicResource.givenName,
      },
      roles: [{ value: publicResource.role, primary: true, type: "work" }],
    };
  };

  constructor(user: SCIMUserResource = {} as SCIMUserResource) {
    super();
    this.resource = user;
  }

  /**
   * REGISTRATION HANDLERS
   */

  public registerCreateDBCallback = (
    callback: (resource: SCIMUserPublic) => Promise<SCIMUserPublic>
  ) => {
    this.registeredDatabaseHandlers[ResourceDBCallBackType.Create] = callback;
  };
  public registerListDBCallback = (
    callback: (query: ListFilter) => Promise<SCIMUserPublic[]>
  ) => {
    this.registeredDatabaseHandlers[ResourceDBCallBackType.List] = callback;
  };
  public registerUpdateDBCallback = (
    callback: (
      resource: PatchRequest,
      resourceId: string
    ) => Promise<SCIMUserPublic>
  ) => {
    this.registeredDatabaseHandlers[ResourceDBCallBackType.Update] = callback;
  };
  public registerDeleteDBCallback = (
    callback: (resourceId: string) => Promise<Partial<void>>
  ) => {
    this.registeredDatabaseHandlers[ResourceDBCallBackType.Delete] = callback;
  };
  public registerGetDBCallback = (
    callback: (resourceId: string) => Promise<SCIMUserPublic>
  ) => {
    this.registeredDatabaseHandlers[ResourceDBCallBackType.Get] = callback;
  };

  /**
   * Resource Actions
   */
  public create = async (user: SCIMUserResource) => {
    return await this.registeredDatabaseHandlers[
      ResourceDBCallBackType.Create
    ]?.(this.resourceToPublic(user))
      .then((DBuser) => {
        return {
          statusCode: 201,
          body: JSON.stringify(this.publicToResource(DBuser)),
        };
      })
      .catch((error) => {
        return {
          statusCode: 500,
          body: error,
        };
      });
  };

  public list = async (query?: { filter: any } | undefined | null) => {
    const splitQuery = query?.filter.split(" ");

    return this.registeredDatabaseHandlers[ResourceDBCallBackType.List]?.({
      field: splitQuery[0],
      operator: splitQuery[1],
      value: splitQuery[2],
    })
      .then((users) => {
        return {
          statusCode: 200,
          body: JSON.stringify(
            new ListResource(
              users.map((user) => this.publicToResource(user))
            ).getResource()
          ),
        };
      })
      .catch((error) => {
        return {
          statusCode: 500,
          body: error,
        };
      });
  };

  public update = async (user: SCIMUserResource, userId: string) => {
    return this.registeredDatabaseHandlers[ResourceDBCallBackType.Update]?.(
      this.resourceToPublic(user),
      userId
    )
      .then((user) => {
        return {
          statusCode: 200,
          body: JSON.stringify(this.publicToResource(user)),
        };
      })
      .catch((error) => {
        return {
          statusCode: 500,
          body: error,
        };
      });
  };

  public delete = async (userId: string) => {
    return this.registeredDatabaseHandlers[ResourceDBCallBackType.Delete]?.(
      userId
    )
      .then((user) => {
        return {
          statusCode: 204,
          body: "",
        };
      })
      .catch((error) => {
        return {
          statusCode: 500,
          body: error,
        };
      });
  };

  public get = async (userId: string) => {
    return this.registeredDatabaseHandlers[ResourceDBCallBackType.Get]?.(userId)
      .then((user) => {
        if (Object.keys(user).length === 0) {
          return {
            statusCode: 404,
            body: JSON.stringify(
              new SCIMError(404, "User not found").getResource()
            ),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(this.publicToResource(user)),
        };
      })
      .catch((error) => {
        return {
          statusCode: 500,
          body: error,
        };
      });
  };
}
