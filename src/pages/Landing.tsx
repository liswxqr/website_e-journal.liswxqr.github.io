import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__brand">
          <div className="sidebar__logo-mark">КБП</div>
          <div>
            <strong>Колледж Бизнеса и Права</strong>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Электронный журнал</div>
          </div>
        </div>
        <div className="row gap-12">
          <a className="btn btn--ghost btn--sm" href="#features">Возможности</a>
          <a className="btn btn--ghost btn--sm" href="#roles">Роли</a>
          {user ? (
            <button className="btn btn--primary" onClick={() => navigate("/dashboard")}>
              Перейти в журнал
            </button>
          ) : (
            <Link to="/login" className="btn btn--primary" style={{ textDecoration: "none" }}>
              Войти
            </Link>
          )}
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-text">
          <span className="badge badge--primary" style={{ alignSelf: "flex-start" }}>УО «Колледж Бизнеса и Права»</span>
          <h1>Электронный журнал нового поколения</h1>
          <p>
            Единая платформа для администрации, преподавателей и студентов:
            оценки по 10-балльной системе, зачёты, посещаемость и расписание —
            всё в одном окне, доступно с любого устройства.
          </p>
          <div className="row gap-12 mt-12">
            {user ? (
              <button className="btn btn--primary" onClick={() => navigate("/dashboard")}>
                Открыть журнал →
              </button>
            ) : (
              <Link to="/login" className="btn btn--primary" style={{ textDecoration: "none" }}>
                Войти в систему →
              </Link>
            )}
            <a href="#roles" className="btn btn--ghost">Узнать больше</a>
          </div>
        </div>

        <div className="landing__hero-art">
          <div className="landing-stat">
            <div className="landing-stat__num">3</div>
            <div className="landing-stat__lbl">Роли пользователей</div>
          </div>
          <div className="landing-stat landing-stat--accent">
            <div className="landing-stat__num">10</div>
            <div className="landing-stat__lbl">Балльная система</div>
          </div>
          <div className="landing-stat">
            <div className="landing-stat__num">∞</div>
            <div className="landing-stat__lbl">Групп и предметов</div>
          </div>
          <div className="landing-stat landing-stat--accent">
            <div className="landing-stat__num">24/7</div>
            <div className="landing-stat__lbl">Доступ из любой точки</div>
          </div>
        </div>
      </section>

      <section id="features" className="landing__section">
        <h2>Возможности системы</h2>
        <div className="grid-3 mt-24">
          <FeatureCard icon="📊" title="Журнал оценок">
            Преподаватель ставит оценки 1–10 прямо в ячейке таблицы. Средний балл и
            пропуски считаются автоматически.
          </FeatureCard>
          <FeatureCard icon="✅" title="Зачёты и аттестация">
            Отдельный режим для зачётов — Зачёт/Незачёт без смешения с числовыми
            оценками.
          </FeatureCard>
          <FeatureCard icon="🗓" title="Гибкое расписание">
            Сетка с 6 учебными днями и до 8 пар. Своё для каждой группы и
            преподавателя.
          </FeatureCard>
          <FeatureCard icon="📍" title="Посещаемость">
            Отметка статуса студента в один клик — присутствовал, отсутствовал,
            опоздал или по уважительной причине.
          </FeatureCard>
          <FeatureCard icon="🛡" title="Изоляция прав">
            Студент видит только свои данные, преподаватель — свои предметы, админ —
            всё. Контроль на стороне сервера.
          </FeatureCard>
          <FeatureCard icon="🔐" title="Безопасность">
            JWT-токены, пароли в bcrypt, проверка ролей на каждом запросе.
          </FeatureCard>
        </div>
      </section>

      <section id="roles" className="landing__section landing__section--alt">
        <h2>Для кого система</h2>
        <div className="grid-3 mt-24">
          <RoleCard icon="🛡" name="Администратор" demo="admin@college.by">
            Управление пользователями, предметами, группами, расписанием. Полный
            доступ ко всем данным.
          </RoleCard>
          <RoleCard icon="📘" name="Преподаватель" demo="teacher@college.by">
            Журнал оценок и зачётов для своих групп, отметка посещаемости, свой
            график занятий.
          </RoleCard>
          <RoleCard icon="🎓" name="Студент" demo="student1@college.by">
            Свои оценки и зачёты по предметам, средний балл, расписание группы,
            пропуски и опоздания.
          </RoleCard>
        </div>

        <div className="landing-callout mt-24">
          <strong>Демо-вход:</strong> пароль для всех учётных записей — <code>123456</code>.
          На странице входа выберите роль и нажмите «Войти».
          {!user && (
            <Link to="/login" className="btn btn--primary btn--sm" style={{ textDecoration: "none", marginLeft: 14 }}>
              Перейти ко входу
            </Link>
          )}
        </div>
      </section>

      <footer className="landing__footer">
        <div>© {new Date().getFullYear()} — Колледж Бизнеса и Права</div>
        <div>Электронный журнал · Учебный проект</div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="landing-feature-card">
      <div className="landing-feature-card__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function RoleCard({ icon, name, demo, children }: { icon: string; name: string; demo: string; children: React.ReactNode }) {
  return (
    <div className="landing-role-card">
      <div className="landing-role-card__icon">{icon}</div>
      <h3>{name}</h3>
      <p>{children}</p>
      <div className="landing-role-card__demo">
        <span className="muted">Демо:</span> <code>{demo}</code>
      </div>
    </div>
  );
}
