import { NavigationRoute } from '../contexts/NavigationContext';

class NavigationController {
  private static instance: NavigationController;
  private navigationCallback?: (route: NavigationRoute) => void;

  private constructor() {}

  public static getInstance(): NavigationController {
    if (!NavigationController.instance) {
      NavigationController.instance = new NavigationController();
    }
    return NavigationController.instance;
  }

  public setNavigationCallback(callback: (route: NavigationRoute) => void) {
    this.navigationCallback = callback;
  }

  // API Methods for LLM
  public navigateToHome(): boolean {
    if (this.navigationCallback) {
      this.navigationCallback('home');
      return true;
    }
    return false;
  }

  public navigateToSales(): boolean {
    if (this.navigationCallback) {
      this.navigationCallback('sales');
      return true;
    }
    return false;
  }

  public navigateToAccount(): boolean {
    if (this.navigationCallback) {
      this.navigationCallback('account');
      return true;
    }
    return false;
  }

  public navigateToReports(): boolean {
    if (this.navigationCallback) {
      this.navigationCallback('reports');
      return true;
    }
    return false;
  }

  public getCurrentRoute(): NavigationRoute | null {
    // This will be implemented when we connect it to the NavigationContext
    return null;
  }
}

export default NavigationController.getInstance();