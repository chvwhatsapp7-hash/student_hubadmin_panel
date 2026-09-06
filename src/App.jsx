import { Routes, Route } from "react-router-dom";
import Dashboard    from "./dashboard/Dashboard";
import Users        from "./users/Users";
import Companies    from "./companies/Companies";
import Internships  from "./internships/Internships";
import Jobs         from "./jobs/Jobs";
import Applications from "./applications/Applications";
import Courses      from "./courses/Courses";
import Hackathons   from "./hackathons/Hackathons";
import Skills       from "./skills/Skills";
import Comments     from "./comments/Comments";
import Nav          from "./nav/Nav";

export default function App() {
  return (
    <div className="admin-layout">
      <Nav />
      <main className="admin-main">
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/users"        element={<Users />} />
          <Route path="/companies"    element={<Companies />} />
          <Route path="/internships"  element={<Internships />} />
          <Route path="/jobs"         element={<Jobs />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/courses"      element={<Courses />} />
          <Route path="/hackathons"   element={<Hackathons />} />
          <Route path="/skills"       element={<Skills />} />
          <Route path="/comments"     element={<Comments />} />
        </Routes>
      </main>
    </div>
  );
}
