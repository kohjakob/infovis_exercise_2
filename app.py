from flask import Flask, render_template
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import json


app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.config['TEMPLATES_AUTO_RELOAD'] = True

@app.route('/')
def data():
    
    # Task 1: 'Load the three CSV files generated in Exercise 1 on the server, and return the data to the client. We use the [Flask template engine](https://flask.palletsprojects.com/en/1.1.x/quickstart/#rendering-templates) Jinja 2 for communication. For data loading, we recommend using [Pandas and JSON](https://pandas.pydata.org/pandas-docs/stable/reference/api/pandas.DataFrame.to_json.html) (up to 5 points).'
    df_agg_team = pd.read_csv('data/df_agg_team.csv')
    df_agg_player = pd.read_csv('data/df_agg_player.csv')
    df_player_stats = pd.read_csv('data/cleaned_df_player_stats.csv')
    
    # Task 2: 'On the server, compute a PCA for either the teams aggregated value or players aggregated values (top 40 current players based on Total Games) tables. You can use [sci-kit learn](https://scikit-learn.org/stable/index.html) to do that. Note that you need to take care of [scaling the features](https://scikit-learn.org/stable/auto_examples/preprocessing/plot_scaling_importance.html) appropriately! Send the resulting 2D coordinates (and potential intermediate steps required for visualization) to the client (up to 5 points).'
    # Select non-empty, numeric cols
    pca_agg_team_features = ['Height', 'Weight', 'Total Games', 'Field Goals', '3pt', '2pt', 'Free Throws', 'Total Rebounds', 'Assists', 'Steals', 'Blocks', 'Turnovers', 'Points']
    df_pca_agg_team = df_agg_team.loc[:, pca_agg_team_features].dropna()
    # Scale features    
    scaler = StandardScaler()
    # PCA using sklearn
    df_pca_agg_team_scaled = scaler.fit_transform(df_pca_agg_team)
    pca = PCA(n_components=2)
    agg_team_pcs = pca.fit_transform(df_pca_agg_team_scaled)
    # Select PC1, PC2 and append Team Name
    df_pca_agg_team_pca = pd.DataFrame(data=agg_team_pcs, columns=['PC1', 'PC2'])
    df_pca_agg_team_pca['Team Name'] = df_agg_team['Team Name']

    df_heatmap_agg_team = df_agg_team.dropna().drop(columns=['Team ID',]).drop(index=0)


    # Return data to frontend    
    data_to_send = {
        'pca': df_pca_agg_team_pca.to_dict(orient='records'),
        'heatmap': df_heatmap_agg_team.to_dict(orient='records'),
    }    
    return render_template("index.html", data=json.dumps(data_to_send))



if __name__ == '__main__':
    app.run(debug=True)
