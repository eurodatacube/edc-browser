export const collectionFactory = ({
  uniqueId,
  id,
  type,
  group,
  ownedByUser = false,
  configurations = null,
  serviceSpecificInfo = {},
}) => {
  return {
    uniqueId,
    id,
    type,
    group,
    ownedByUser,
    configurations,
    serviceSpecificInfo,
  };
};
