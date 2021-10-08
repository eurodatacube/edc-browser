export const collectionFactory = ({
  uniqueId,
  id,
  title,
  type,
  group,
  ownedByUser = false,
  configurations = null,
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
    bands,
    temporalExtent,
    serviceSpecificInfo,
  };
};
