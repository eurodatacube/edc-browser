export const collectionFactory = ({
  uniqueId,
  id,
  title,
  type,
  group,
  ownedByUser = false,
  configurations = null,
  extendedInformationLink = null,
  description = null,
  bands = [],
  temporalExtent = null,
  serviceSpecificInfo = {},
}) => {
  return {
    uniqueId,
    id,
    title,
    type,
    group,
    ownedByUser,
    configurations,
    extendedInformationLink,
    description,
    bands,
    temporalExtent,
    serviceSpecificInfo,
  };
};
