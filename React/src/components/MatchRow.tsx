import React, { ChangeEvent } from "react";

interface Match {
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  match_Id: number; // Ensure match_Id is included
}

interface MatchRowProps {
  match: Match;
  match_id: number; // Include match_id in props
  homeScore: number;
  awayScore: number;
  onHomeScoreChange: (match_id: number, score: string) => void; // Include match_id in callback
  onAwayScoreChange: (match_id: number, score: string) => void; // Include match_id in callback
  hasStarted: boolean;
}

const MatchRow: React.FC<MatchRowProps> = ({
  match,
  match_id, // Destructure match_id from props
  homeScore,
  awayScore,
  onHomeScoreChange,
  onAwayScoreChange,
  hasStarted,
}) => {
  const { homeTeam, awayTeam, date, time } = match;

  return (
    <tr>
      <th scope="row" className="align-middle text-center">
        {date}
      </th>
      <td className="align-middle text-center">{time}</td>
      <td className="align-middle text-center team-name">{homeTeam}</td>
      <td className="align-middle text-center">
        {hasStarted ? (
          <span>{homeScore !== undefined ? homeScore.toString() : "-"}</span>
        ) : (
          <input
            type="text"
            className="form-control score-input"
            value={homeScore !== undefined ? homeScore.toString() : ""}
            onChange={
              (e: ChangeEvent<HTMLInputElement>) =>
                onHomeScoreChange(match_id, e.target.value) // Pass match_id to callback
            }
          />
        )}
      </td>
      <td className="align-middle text-center">:</td>
      <td className="align-middle text-center">
        {hasStarted ? (
          <span>{awayScore !== undefined ? awayScore.toString() : "-"}</span>
        ) : (
          <input
            type="text"
            className="form-control score-input"
            value={awayScore !== undefined ? awayScore.toString() : ""}
            onChange={
              (e: ChangeEvent<HTMLInputElement>) =>
                onAwayScoreChange(match_id, e.target.value) // Pass match_id to callback
            }
          />
        )}
      </td>
      <td className="align-middle text-center team-name">{awayTeam}</td>
    </tr>
  );
};

export default MatchRow;
