export const collectionFactory = ({
  uniqueId,
  id,
  title,
  type,
  group,
  ownedByUser = false,
  configurations = null,
  bands = [],
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
    serviceSpecificInfo,
  };
};
