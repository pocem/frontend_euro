import React, { useState, useEffect } from "react";
import metaData from "../../matchdata.json";
import Button from "./Button";
import MatchRow from "./MatchRow";
import "../App.css";

type Match = {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  match_Id: number; // Ensure consistency with your data structure
};

const Matches: React.FC = () => {
  const [currentDay, setCurrentDay] = useState(0);
  const [allScores, setAllScores] = useState<{ [day: number]: DayScores }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [unsuccessfulMessage, setUnsuccessfulMessage] = useState("");

  interface DayScores {
    homeScores: { [match_Id: number]: number };
    awayScores: { [match_Id: number]: number };
    submitted: boolean;
  }

  const matches: Match[] = metaData.matchesData.map(
    ([homeTeam, awayTeam, date, time, matchId]) => ({
      homeTeam: String(homeTeam),
      awayTeam: String(awayTeam),
      date: String(date),
      time: String(time),
      match_Id: Number(matchId), // Assuming matchId needs to be a number, cast accordingly
    })
  );

  const filteredMatches: Match[] = matches.filter((match) => {
    const matchDay = parseInt(match.date.split(" ")[0]);
    return matchDay === currentDay + 14;
  });

  useEffect(() => {
    const fetchSavedPredictions = async () => {
      try {
        const response = await fetch(
          "https://matchpredict-f88c889f1126.herokuapp.com/predictions",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          setUnsuccessfulMessage("Failed to fetch saved predictions.");
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        const newAllScores: { [day: number]: DayScores } = {};

        data.forEach(
          (prediction: {
            match_Id: number;
            home_score: number;
            away_score: number;
          }) => {
            const { match_Id, home_score, away_score } = prediction;

            const matchIndex = matches.findIndex(
              (match) => match.match_Id === match_Id
            );

            if (matchIndex !== -1) {
              const matchDay = parseInt(matches[matchIndex].date.split(" ")[0]);
              const dayIndex = matchDay - 14;

              newAllScores[dayIndex] = newAllScores[dayIndex] || {
                homeScores: {},
                awayScores: {},
                submitted: false,
              };

              newAllScores[dayIndex].homeScores[match_Id] = home_score;
              newAllScores[dayIndex].awayScores[match_Id] = away_score;
            }
          }
        );

        setAllScores(newAllScores);
        console.log("all scores data:", newAllScores);
      } catch (error) {
        console.error("Error:", error);
        setUnsuccessfulMessage("Failed to fetch saved predictions.");
      }
    };

    fetchSavedPredictions();
  }, []);

  const handleHomeScoreChange = (matchId: number, score: string) => {
    const newScores = { ...allScores };
    newScores[currentDay] = newScores[currentDay] || {
      homeScores: {},
      awayScores: {},
      submitted: false,
    };
    newScores[currentDay].homeScores[matchId] = parseInt(score, 10);
    setAllScores(newScores);
  };

  const handleAwayScoreChange = (matchId: number, score: string) => {
    const newScores = { ...allScores };
    newScores[currentDay] = newScores[currentDay] || {
      homeScores: {},
      awayScores: {},
      submitted: false,
    };
    newScores[currentDay].awayScores[matchId] = parseInt(score, 10);
    setAllScores(newScores);
  };

  const handleSubmit = async () => {
    const currentScores = allScores[currentDay] || {
      homeScores: {},
      awayScores: {},
      submitted: false,
    };

    let atLeastOneScoreFilled = false;

    // Prepare formData for submission
    const formData = filteredMatches
      .map((match) => {
        // Find the match in the original matchesData to get its index
        const matchIndex = metaData.matchesData.findIndex(
          (data) => data[0] === match.homeTeam && data[1] === match.awayTeam
        );

        if (matchIndex === -1) {
          console.error(
            `Match not found in matchesData: ${match.homeTeam} vs ${match.awayTeam}`
          );
          return null;
        }

        // Calculate match position (index + 1 since indices are zero-based)
        const matchPosition = matchIndex + 1;
        const matchId = matchPosition;

        // Retrieve homeScore and awayScore from currentScores
        const homeScore = currentScores.homeScores[matchId];
        const awayScore = currentScores.awayScores[matchId];

        // Check if at least one score is filled out
        if (!isNaN(homeScore) && !isNaN(awayScore)) {
          atLeastOneScoreFilled = true;
        }

        return {
          match_id: matchId,
          homeScore,
          awayScore,
        };
      })
      .filter((formDataEntry) => formDataEntry !== null); // Filter out any null entries

    // If no scores are filled out, show error message and return
    if (!atLeastOneScoreFilled) {
      setUnsuccessfulMessage(
        "Please provide valid scores for at least one match."
      );
      return;
    }

    try {
      // Send formData to backend for submission
      const response = await fetch(
        "https://matchpredict-f88c889f1126.herokuapp.com/predictions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      // Handle response from backend
      if (!response.ok) {
        setUnsuccessfulMessage("Predictions were not saved.");
        throw new Error("Network response was not ok");
      }

      // Update allScores to mark current day as submitted
      const newScores = { ...allScores };
      newScores[currentDay] = { ...currentScores, submitted: true };
      setAllScores(newScores);

      setSuccessMessage("Predictions saved.");
    } catch (error) {
      console.error("Error:", error);
      setUnsuccessfulMessage("Failed to save predictions.");
    }
  };

  const handleNextDay = () => {
    setCurrentDay(currentDay + 1);
  };

  const handleLastDay = () => {
    setCurrentDay(currentDay - 1);
  };

  const handleAnimationEnd = () => {
    setSuccessMessage("");
    setUnsuccessfulMessage("");
  };

  const currentScores = allScores[currentDay] || {
    homeScores: {},
    awayScores: {},
    submitted: false,
  };

  return (
    <div className="text-center">
      <table className="mx-auto mt-5 table col-1">
        <thead>
          <div className="col-2">
            <tr>
              <th className="day-count">Day {currentDay + 1}</th>
            </tr>
          </div>
        </thead>
        <tbody>
          {filteredMatches.map((match) => {
            // Assuming match.date is in the format "DD MMM"
            const [day, month] = match.date.split(" ");
            const year = new Date().getFullYear(); // Assuming the current year

            // Getting the month index (0-based) based on the month abbreviation
            const monthIndex = new Date(
              Date.parse(`${month} 1, 2000`)
            ).getMonth();

            // Constructing the date string in MM/DD/YYYY format
            const formattedDate = `${monthIndex + 1}/${day}/${year}`;
            console.log("formatted date", formattedDate);

            // Constructing the full datetime string for comparison
            const matchDateTime = new Date(`${formattedDate} ${match.time}`);
            console.log("current date", new Date());
            console.log("Has the game started?", new Date() >= matchDateTime);

            return (
              <MatchRow
                key={match.match_Id}
                match={match}
                match_id={match.match_Id}
                homeScore={currentScores.homeScores[match.match_Id]}
                awayScore={currentScores.awayScores[match.match_Id]}
                onHomeScoreChange={(match_id: number, score: string) =>
                  handleHomeScoreChange(match.match_Id, score)
                }
                onAwayScoreChange={(match_id: number, score: string) =>
                  handleAwayScoreChange(match.match_Id, score)
                }
                hasStarted={new Date() >= matchDateTime}
              />
            );
          })}
        </tbody>
      </table>
      <div className="col-6 mx-auto matches-alert">
        {successMessage && (
          <div
            className={`alert alert-success fade-in-out${
              successMessage ? "" : "hidden"
            }`}
            role="alert"
            onAnimationEnd={handleAnimationEnd}
          >
            {successMessage}
          </div>
        )}
        {unsuccessfulMessage && (
          <div
            className={`alert alert-danger ${
              unsuccessfulMessage ? "" : "hidden"
            }`}
            role="alert"
            onAnimationEnd={handleAnimationEnd}
          >
            {unsuccessfulMessage}
          </div>
        )}
      </div>
      <div>
        <div className="button-container">
          {currentDay > 0 && (
            <Button color="success" onClick={handleLastDay}>
              Last Day
            </Button>
          )}
          <span className="mx-2"></span>
          {currentDay < 12 && (
            <Button color="success" onClick={handleNextDay}>
              Next Day
            </Button>
          )}
        </div>

        <div className="button-container-submit">
          <Button color="success button-hover btn-lg" onClick={handleSubmit}>
            {"Submit Day " + (currentDay + 1)}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Matches;
