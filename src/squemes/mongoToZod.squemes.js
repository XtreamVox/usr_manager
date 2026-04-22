import { z } from "zod";
import Client from "../models/client.models.js";
import User from "../models/user.models.js";
import Company from "../models/company.models.js";
import Project from "../models/project.models.js";


// TODO sustituir los switch por un comportamiento dinámico
const clientTypeToZod = (instance, path) => {
  switch (instance) {
    case "String":
      return path.enumValues?.length ? z.enum(path.enumValues) : z.string();

    case "Number":
      return z.coerce.number();

    case "Boolean":
      return z.coerce.boolean();

    case "Date":
      return z.coerce.date();

    default:
      return z.any();
  }
};

const userTypeToZod = (instance, path) =>{
    switch (instance) {
    }
}


const companyTypeToZod = (instance, path) =>{
    switch (instance) {
    }
}

const projectTypeToZod = (instance, path) =>{
    switch (instance) {
    }
}

const buildSchemaMap = (schemaPaths, mapper) =>
  Object.fromEntries(
    Object.entries(schemaPaths)
      .filter(([key]) => !key.startsWith("_") && key !== "__v")
      .map(([key, path]) => [key, mapper(path.instance, path)]),
  );

export const getSchemaMap = (model) => {
  switch (model) {
    case "client":
      return buildSchemaMap(Client.schema.paths, clientTypeToZod);

    case "user":
      return buildSchemaMap(User.schema.paths, userTypeToZod);

    case "company":
      return buildSchemaMap(Company.schema.paths, companyTypeToZod);
    
      case "project":
      return buildSchemaMap(Project.schema.paths, projectTypeToZod);

    default:
      throw new Error("Modelo no soportado");
  }
};
