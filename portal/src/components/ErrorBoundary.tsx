import { Component, type ErrorInfo, type ReactNode } from "react";
import { logReactError } from "../lib/bugLog";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logReactError(error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="auth">
          <div className="auth-card" style={{ gridTemplateColumns: "1fr", maxWidth: 520 }}>
            <div className="auth-form">
              <h2>Ошибка интерфейса</h2>
              <p className="muted">{this.state.error.message}</p>
              <button className="btn btn-primary btn-wide" type="button" onClick={() => location.reload()}>
                Перезагрузить
              </button>
              <button
                className="btn btn-ghost btn-wide"
                type="button"
                onClick={() => this.setState({ error: null })}
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
