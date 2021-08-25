import { initializeServiceHandlers } from '../../services';

const ServiceHandlersInitializer = ({ children }) => {
  initializeServiceHandlers();
  return children;
};

export default ServiceHandlersInitializer;
