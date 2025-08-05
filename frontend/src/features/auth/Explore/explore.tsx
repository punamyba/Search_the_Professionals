import { useNavigate } from "react-router-dom";
import "./explore.css";


export default function Explore() {
const navigate = useNavigate();


return(
    <div className="welcomepart">
    <section>
       <h1>Welcome to Explore Page</h1>
      <p>Your gateway to amazing job opportunities and career growth.</p>
    </section>
    </div>
)



}